import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type UserId = Principal;
  type Username = Text;

  // Initialize access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type Message = {
    id : MessageId;
    senderId : UserId;
    senderUsername : Username;
    content : Text;
    createdAt : Time.Time;
    attachment : ?Storage.ExternalBlob;
    edited : Bool;
  };

  public type MessageId = Nat;

  public type RoomId = Text;

  public type DirectMessageThreadId = Nat;
  var directMessageThreadCounter = 0;

  public type DirectMessage = {
    id : MessageId;
    senderId : UserId;
    senderUsername : Text;
    receiverId : UserId;
    content : Text;
    createdAt : Time.Time;
    attachment : ?Storage.ExternalBlob;
    edited : Bool;
  };

  public type DirectMessageThread = {
    id : DirectMessageThreadId;
    participant1 : UserId;
    participant2 : UserId;
    createdAt : Time.Time;
    messages : [DirectMessage];
    lastUpdated : Time.Time;
  };

  let directMessageThreads = Map.empty<DirectMessageThreadId, DirectMessageThread>();

  public type UserProfile = {
    userId : UserId;
    username : Username;
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    createdAt : Time.Time;
    lastSeen : Time.Time;
    isOnline : Bool;
  };

  module UserProfile {
    public func compare(a : UserProfile, b : UserProfile) : Order.Order {
      a.username.compare(b.username);
    };
  };

  module Message {
    public func compare(a : Message, b : Message) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };
  };

  public type DirectMessageSummary = {
    threadId : Nat;
    participant1 : UserId;
    participant2 : UserId;
    participants : (Text, Text);
    participant1Username : Text;
    participant2Username : Text;
    lastMessage : ?DirectMessage;
    unreadCount : Nat;
    totalMessages : Nat;
    lastUpdated : Time.Time;
    createdAt : Time.Time;
  };

  var messageCounter = 0;
  var siteLogo : ?Storage.ExternalBlob = null;
  let startupTime = Time.now();

  let users = Map.empty<UserId, UserProfile>();
  let usernameToId = Map.empty<Text, UserId>();
  let globalMessages = Map.empty<MessageId, Message>();
  let deletedMessageIds = Map.empty<MessageId, ()>();

  let failedLoginAttempts = List.empty<UserId>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    users.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    // Ensure user can only save their own profile
    if (profile.userId != caller) {
      Runtime.trap("Unauthorized: Cannot save profile for another user");
    };

    users.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow users to view their own profile or admins to view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      // For other users, only allow if caller is authenticated
      if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
        Runtime.trap("Unauthorized: Only authenticated users can view profiles");
      };
    };
    users.get(user);
  };

  public query ({ caller }) func getProfile(user : UserId) : async UserProfile {
    // Authenticated users can view profiles
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (users.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public query ({ caller }) func getAllProfiles() : async [UserProfile] {
    // Authenticated users can view the user directory
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view user directory");
    };

    users.values().toArray().sort();
  };

  public shared ({ caller }) func updateDisplayName(newDisplayName : Text) : async () {
    // Only authenticated users can update their profile
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update display name");
    };

    switch (users.get(caller)) {
      case (?profile) {
        if (Text.equal(newDisplayName, "")) {
          Runtime.trap("Display name cannot be empty");
        };
        let updatedProfile : UserProfile = {
          userId = caller;
          username = profile.username;
          displayName = newDisplayName;
          bio = profile.bio;
          avatar = profile.avatar;
          createdAt = profile.createdAt;
          lastSeen = Time.now();
          isOnline = profile.isOnline;
        };
        users.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func logout() : async () {
    // Only authenticated users can logout
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can logout");
    };

    switch (users.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          userId = caller;
          username = profile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          createdAt = profile.createdAt;
          lastSeen = Time.now();
          isOnline = false;
        };
        users.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func toggleOnlineStatus(isOnline : Bool) : async () {
    // Only authenticated users can toggle status
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle online status");
    };

    switch (users.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          userId = caller;
          username = profile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          createdAt = profile.createdAt;
          lastSeen = Time.now();
          isOnline;
        };
        users.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  public shared ({ caller }) func updateBio(newBio : Text) : async () {
    // Only authenticated users can update their bio
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update bio");
    };

    switch (users.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          userId = caller;
          username = profile.username;
          displayName = profile.displayName;
          bio = newBio;
          avatar = profile.avatar;
          createdAt = profile.createdAt;
          lastSeen = Time.now();
          isOnline = profile.isOnline;
        };
        users.add(caller, updatedProfile);
      };
      case (null) { Runtime.trap("Profile not found") };
    };
  };

  func updateGlobalMessages(message : Message) {
    globalMessages.add(message.id, message);
  };

  public query ({ caller }) func fetchGlobalMessages(fromTimestamp : Time.Time) : async [Message] {
    // Only authenticated users can fetch messages
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch messages");
    };

    let allMessages = globalMessages.values().toArray();
    let filteredMessages = allMessages.filter(func(msg) { msg.createdAt > fromTimestamp });

    // Filter out deleted messages
    let visibleMessages = filteredMessages.filter(
      func(msg) { not deletedMessageIds.containsKey(msg.id) }
    );

    visibleMessages.sort();
  };

  func findThreadId(participant1 : Principal, participant2 : Principal) : ?DirectMessageThreadId {
    var foundThreadId : ?DirectMessageThreadId = null;
    directMessageThreads.forEach(
      func(threadId, thread) {
        if ((thread.participant1 == participant1 and thread.participant2 == participant2) or
          (thread.participant1 == participant2 and thread.participant2 == participant1)) {
          foundThreadId := ?threadId;
        };
      }
    );
    foundThreadId;
  };

  func isThreadParticipant(caller : Principal, thread : DirectMessageThread) : Bool {
    thread.participant1 == caller or thread.participant2 == caller;
  };

  public shared ({ caller }) func sendDirectMessage(receiver : Principal, content : Text, attachment : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send direct messages");
    };

    let receiverProfile = users.get(receiver);
    if (receiverProfile == null) {
      Runtime.trap("Receiver does not exist!");
    };

    let senderUsername = switch (users.get(caller)) {
      case (?profile) { profile.username };
      case (null) { caller.toText() };
    };

    let newMessage : DirectMessage = {
      id = messageCounter;
      senderId = caller;
      senderUsername;
      receiverId = receiver;
      content;
      createdAt = Time.now();
      attachment;
      edited = false;
    };
    messageCounter += 1;

    let (threadId, thread) = switch (findThreadId(caller, receiver)) {
      case (?id) {
        switch (directMessageThreads.get(id)) {
          case (?t) { (id, t) };
          case (null) { Runtime.trap("Thread not found for existing threadId") };
        };
      };
      case (null) {
        let newThreadId = directMessageThreadCounter;
        directMessageThreadCounter += 1;
        let thread1 = {
          id = newThreadId;
          participant1 = caller;
          participant2 = receiver;
          createdAt = Time.now();
          messages = [];
          lastUpdated = Time.now();
        };
        directMessageThreads.add(newThreadId, thread1);
        (newThreadId, thread1);
      };
    };

    let updatedMessages = thread.messages.concat([newMessage]);
    let threadUpdated : DirectMessageThread = {
      id = thread.id;
      participant1 = thread.participant1;
      participant2 = thread.participant2;
      createdAt = thread.createdAt;
      messages = updatedMessages;
      lastUpdated = Time.now();
    };
    directMessageThreads.add(threadId, threadUpdated);
  };

  public query ({ caller }) func getDirectMessageThread(participant : Principal) : async ?[DirectMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch direct messages");
    };

    switch (findThreadId(caller, participant)) {
      case (?threadId) {
        switch (directMessageThreads.get(threadId)) {
          case (?thread) {
            if (not isThreadParticipant(caller, thread)) {
              Runtime.trap("Unauthorized: Can only access your own direct message threads");
            };
            ?thread.messages;
          };
          case (null) { null };
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getDirectMessagesWithStats(participant : Principal) : async {
    messages : [DirectMessage];
    totalCount : Nat;
    unreadCount : Nat;
    lastMessageTime : ?Int;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch direct messages");
    };

    switch (findThreadId(caller, participant)) {
      case (?threadId) {
        switch (directMessageThreads.get(threadId)) {
          case (?thread) {
            if (not isThreadParticipant(caller, thread)) {
              Runtime.trap("Unauthorized: Can only access your own direct message threads");
            };

            var unreadCount = 0;
            if (thread.messages.size() > 0) {
              var unreadCount = 0;
            };
            let lastMessageTime = if (thread.messages.size() > 0) {
              ?thread.messages[thread.messages.size() - 1].createdAt;
            } else { null };

            {
              messages = thread.messages;
              totalCount = thread.messages.size();
              unreadCount;
              lastMessageTime;
            };
          };
          case (null) {
            {
              messages = [];
              totalCount = 0;
              unreadCount = 0;
              lastMessageTime = null;
            };
          };
        };
      };
      case (null) {
        {
          messages = [];
          totalCount = 0;
          unreadCount = 0;
          lastMessageTime = null;
        };
      };
    };
  };

  public query ({ caller }) func getAllDirectMessagesWithUser(userId : UserId) : async [DirectMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch direct messages");
    };

    switch (findThreadId(caller, userId)) {
      case (?threadId) {
        switch (directMessageThreads.get(threadId)) {
          case (?thread) {
            if (not isThreadParticipant(caller, thread)) {
              Runtime.trap("Unauthorized: Can only access your own direct message threads");
            };
            thread.messages;
          };
          case (null) { [] };
        };
      };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getAllDirectMessagesStats(userId : UserId) : async {
    messages : [DirectMessage];
    totalCount : Nat;
    unreadCount : Nat;
    lastMessageTime : ?Int;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch direct messages");
    };

    switch (findThreadId(caller, userId)) {
      case (?threadId) {
        switch (directMessageThreads.get(threadId)) {
          case (?thread) {
            if (not isThreadParticipant(caller, thread)) {
              Runtime.trap("Unauthorized: Can only access your own direct message threads");
            };

            var unreadCount = 0;
            if (thread.messages.size() > 0) {
              var unreadCount = 0;
            };
            let lastMessageTime = if (thread.messages.size() > 0) {
              ?thread.messages[thread.messages.size() - 1].createdAt;
            } else { null };

            {
              messages = thread.messages;
              totalCount = thread.messages.size();
              unreadCount;
              lastMessageTime;
            };
          };
          case (null) {
            {
              messages = [];
              totalCount = 0;
              unreadCount = 0;
              lastMessageTime = null;
            };
          };
        };
      };
      case (null) {
        {
          messages = [];
          totalCount = 0;
          unreadCount = 0;
          lastMessageTime = null;
        };
      };
    };
  };

  public query ({ caller }) func getDirectMessageThreadsStats() : async [DirectMessageSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch direct messages");
    };

    let allThreads = directMessageThreads.values().toArray();
    let callerThreads = allThreads.filter(func(thread) { isThreadParticipant(caller, thread) });
    let threadSummaries = callerThreads.map(func(thread) { createDirectMessagesSummary(thread) });
    threadSummaries;
  };

  func createDirectMessagesSummary(thread : DirectMessageThread) : DirectMessageSummary {
    let (participant1Username, participant2Username) = switch (users.get(thread.participant1)) {
      case (?user1Profile) {
        switch (users.get(thread.participant2)) {
          case (?user2Profile) {
            (user1Profile.username, user2Profile.username);
          };
          case (null) { ("", "") };
        };
      };
      case (null) { ("", "") };
    };

    {
      threadId = thread.id;
      participant1 = thread.participant1;
      participant2 = thread.participant2;
      participants = (participant1Username, participant2Username);
      participant1Username;
      participant2Username;
      lastMessage = if (thread.messages.size() > 0) {
        ?thread.messages[thread.messages.size() - 1];
      } else { null };
      unreadCount = 0;
      totalMessages = thread.messages.size();
      lastUpdated = thread.lastUpdated;
      createdAt = thread.createdAt;
    };
  };

  public shared ({ caller }) func sendMessage(roomId : RoomId, content : Text, attachment : ?Storage.ExternalBlob) : async () {
    // Only authenticated users can send messages
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    // Get sender's username from profile
    let senderUsername = switch (users.get(caller)) {
      case (?profile) { profile.username };
      case (null) { caller.toText() };
    };

    let newMessage : Message = {
      id = messageCounter;
      senderId = caller;
      senderUsername;
      content;
      createdAt = Time.now();
      attachment;
      edited = false;
    };
    updateGlobalMessages(newMessage);
    messageCounter += 1;

    // Update last seen
    switch (users.get(caller)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          userId = profile.userId;
          username = profile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          createdAt = profile.createdAt;
          lastSeen = Time.now();
          isOnline = profile.isOnline;
        };
        users.add(caller, updatedProfile);
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func updateMessage(roomId : RoomId, messageId : MessageId, newContent : ?Text, newAttachment : ?Storage.ExternalBlob) : async Bool {
    // Only authenticated users can update messages
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update messages");
    };

    switch (globalMessages.get(messageId)) {
      case (null) { false };
      case (?oldMessage) {
        // Only the sender can update their own message
        if (oldMessage.senderId != caller) {
          Runtime.trap("Unauthorized: Can only update your own messages");
        };

        let updatedMessage : Message = {
          id = oldMessage.id;
          senderId = oldMessage.senderId;
          senderUsername = oldMessage.senderUsername;
          content = switch (newContent) {
            case (null) { oldMessage.content };
            case (?c) { c };
          };
          createdAt = oldMessage.createdAt;
          edited = true;
          attachment = switch (newAttachment) {
            case (null) { oldMessage.attachment };
            case (?a) { ?a };
          };
        };
        globalMessages.add(messageId, updatedMessage);
        true;
      };
    };
  };

  public shared ({ caller }) func uploadAvatar(avatarBlob : Storage.ExternalBlob) : async () {
    // Only authenticated users can upload avatars
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can upload avatars");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?user) {
        let updatedUser : UserProfile = {
          userId = user.userId;
          username = user.username;
          displayName = user.displayName;
          bio = user.bio;
          avatar = ?avatarBlob;
          createdAt = user.createdAt;
          lastSeen = Time.now();
          isOnline = user.isOnline;
        };
        users.add(caller, updatedUser);
      };
    };
  };

  public shared ({ caller }) func sendMessageWithAttachments(roomId : RoomId, content : Text, attachments : [Storage.ExternalBlob]) : async () {
    // Only authenticated users can send messages with attachments
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages with attachments");
    };

    ignore roomId;
    ignore content;
    ignore attachments;
  };

  public shared ({ caller }) func setSiteLogo(newLogo : Storage.ExternalBlob) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update site logo");
    };
    siteLogo := ?newLogo;
  };

  public query ({ caller }) func getSiteLogo() : async ?Storage.ExternalBlob {
    siteLogo;
  };

  // Health/Status endpoint - accessible to all (including guests)
  public query func getStatus() : async {
    canisterTime : Time.Time;
    startupTime : Time.Time;
    userCount : Nat;
    messageCount : Nat;
  } {
    {
      canisterTime = Time.now();
      startupTime;
      userCount = users.size();
      messageCount = globalMessages.size();
    };
  };

  // New update method to delete a global chat message
  public shared ({ caller }) func deleteGlobalMessage(messageId : MessageId) : async () {
    // Ensure only the original sender or admins can delete the message
    switch (globalMessages.get(messageId)) {
      case (null) { Runtime.trap("Message not found") };
      case (?msg) {
        if (msg.senderId != caller and not (AccessControl.isAdmin(accessControlState, caller))) {
          Runtime.trap("Unauthorized: Only the sender or an admin can delete this message");
        };
        deletedMessageIds.add(messageId, ());
      };
    };
  };
};
