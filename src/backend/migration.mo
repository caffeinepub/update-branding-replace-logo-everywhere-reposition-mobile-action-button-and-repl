import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type UserId = Principal;
  type MessageId = Nat;
  type RoomId = Text;

  type OldMessage = {
    id : MessageId;
    senderId : UserId;
    senderUsername : Text;
    content : Text;
    createdAt : Int;
    attachment : ?Storage.ExternalBlob;
    edited : Bool;
  };

  type OldUserProfile = {
    userId : UserId;
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : ?Storage.ExternalBlob;
    createdAt : Int;
    lastSeen : Int;
    isOnline : Bool;
  };

  type OldActor = {
    users : Map.Map<UserId, OldUserProfile>;
    usernameToId : Map.Map<Text, UserId>;
    globalMessages : Map.Map<MessageId, OldMessage>;
    deletedMessageIds : Map.Map<MessageId, ()>;
    messageCounter : Nat;
    siteLogo : ?Storage.ExternalBlob;
    failedLoginAttempts : List.List<UserId>;
  };

  type DirectMessageThreadId = Nat;
  type DirectMessage = {
    id : MessageId;
    senderId : UserId;
    senderUsername : Text;
    receiverId : UserId;
    content : Text;
    createdAt : Int;
    attachment : ?Storage.ExternalBlob;
    edited : Bool;
  };

  type DirectMessageThread = {
    id : DirectMessageThreadId;
    participant1 : UserId;
    participant2 : UserId;
    createdAt : Int;
    messages : [DirectMessage];
    lastUpdated : Int;
  };

  type NewActor = {
    users : Map.Map<UserId, OldUserProfile>;
    usernameToId : Map.Map<Text, UserId>;
    globalMessages : Map.Map<MessageId, OldMessage>;
    deletedMessageIds : Map.Map<MessageId, ()>;
    messageCounter : Nat;
    siteLogo : ?Storage.ExternalBlob;
    failedLoginAttempts : List.List<UserId>;
    directMessageThreads : Map.Map<DirectMessageThreadId, DirectMessageThread>;
    directMessageThreadCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      directMessageThreads = Map.empty<DirectMessageThreadId, DirectMessageThread>();
      directMessageThreadCounter = 0;
    };
  };
};
