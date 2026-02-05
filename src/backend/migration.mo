import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type MessageId = Nat;
  type UserId = Principal;
  type Username = Text;

  type OldActor = {
    globalMessages : Map.Map<MessageId, {
      id : MessageId;
      senderId : UserId;
      senderUsername : Username;
      content : Text;
      createdAt : Time.Time;
      attachment : ?Storage.ExternalBlob;
      edited : Bool;
    }>;
    // Old state type
  };

  type NewActor = {
    globalMessages : Map.Map<MessageId, {
      id : MessageId;
      senderId : UserId;
      senderUsername : Username;
      content : Text;
      createdAt : Time.Time;
      attachment : ?Storage.ExternalBlob;
      edited : Bool;
    }>;
    deletedMessageIds : Map.Map<MessageId, ()>;
  };

  public func run(old : OldActor) : NewActor {
    // Add a new empty deletedMessageIds map to the existing state
    {
      globalMessages = old.globalMessages;
      deletedMessageIds = Map.empty<MessageId, ()>();
    };
  };
};
