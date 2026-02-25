import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var nextReferralId = 10000;
  let wallet = Map.empty<Text, Nat>();
  let transactions = Map.empty<Text, Transaction>();

  public type UserProfile = {
    name : Text;
    mobileNumber : Text;
    referralCode : Text;
    uplineReferralCode : Text;
    totalIncome : Nat;
    levelIncome : Nat;
    depositTotal : Nat;
    withdrawalTotal : Nat;
    registrationTimestamp : Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Transaction = {
    from : Text;
    to : Text;
    amount : Nat;
    timestamp : Time.Time;
    transactionType : TransactionType;
  };

  public type TransactionType = {
    #deposit;
    #withdrawal;
    #transfer;
  };

  wallet.add("000000", 1000_000_000);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createReferralId() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create referral IDs");
    };
    let newText = nextReferralId.toText();
    nextReferralId += 1;
    newText;
  };

  func generateTransaction(from : Text, to : Text, amount : Nat, transactionType : TransactionType) {
    let id = Int.toText(Time.now()) # "-" # amount.toText();
    let transaction : Transaction = {
      from;
      to;
      amount;
      timestamp = Time.now();
      transactionType;
    };
    transactions.add(id, transaction);
  };

  public shared ({ caller }) func addBalanceToReferral(ref : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add balance to referrals");
    };
    switch (wallet.get(ref)) {
      case (?balance) {
        let newBalance = balance + amount;
        wallet.add(ref, newBalance);
        generateTransaction("system", ref, amount, #deposit);
      };
      case (null) { Runtime.trap("Referral not found.") };
    };
  };

  public shared ({ caller }) func transfer(from : Text, to : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform transfers between arbitrary accounts");
    };
    if (amount == 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    let fromBalance = switch (wallet.get(from)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    if (fromBalance < amount) {
      Runtime.trap("Insufficient balance for transfer");
    };

    let toBalance = switch (wallet.get(to)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    wallet.add(from, fromBalance - amount);
    wallet.add(to, toBalance + amount);

    generateTransaction(from, to, amount, #transfer);
  };

  public shared ({ caller }) func withdraw(ref : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can process withdrawals");
    };
    if (amount == 0) {
      Runtime.trap("Amount must be greater than 0");
    };

    switch (wallet.get(ref)) {
      case (?currentBalance) {
        if (currentBalance < amount) {
          Runtime.trap("Insufficient balance for withdrawal");
        };

        wallet.add(ref, currentBalance - amount);
        generateTransaction(ref, "system", amount, #withdrawal);
      };
      case (null) { Runtime.trap("Referral not found.") };
    };
  };

  public shared ({ caller }) func getBalance(ref : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query balances");
    };
    switch (wallet.get(ref)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public shared ({ caller }) func getAllTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all transactions");
    };
    transactions.values().toArray();
  };

  public shared ({ caller }) func getTransactionsByReferral(ref : Text) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view transactions");
    };
    let filtered = transactions.values().filter(
      func(transaction : Transaction) : Bool {
        transaction.from == ref or transaction.to == ref;
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func setBalance(ref : Text, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set balances");
    };
    wallet.add(ref, amount);
  };

  public shared ({ caller }) func getAllBalances() : async [(Text, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all balances");
    };
    wallet.toArray();
  };
};
