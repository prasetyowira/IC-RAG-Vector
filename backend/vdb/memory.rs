use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl,StableBTreeMap};
use std::cell::RefCell;
use candid::Principal;

// A memory for upgrades, where data from the heap can be serialized/deserialized.
const UPGRADES: MemoryId = MemoryId::new(0);

// A memory for the StableBTreeMap we're using. A new memory should be created for
// every additional stable structure.
const STABLE_BTREE: MemoryId = MemoryId::new(1);
const CONFIG_MEMORY: MemoryId = MemoryId::new(2);

pub type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    // The memory manager is used for simulating multiple memories. Given a `MemoryId` it can
    // return a memory that can be used by stable structures.
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    static CONFIG_MAP: RefCell<StableBTreeMap<String, String, Memory>> =
        RefCell::new(StableBTreeMap::init(MEMORY_MANAGER.with_borrow(|m| m.get(CONFIG_MEMORY))));

    static OWNER: RefCell<Option<Principal>> = RefCell::new(None);

}

pub fn set_owner(owner: Principal) {
    OWNER.with(|owner_ref| {
        *owner_ref.borrow_mut() = Some(owner);
    });
}
pub fn is_owner() -> bool {
    let caller = ic_cdk::caller();
    OWNER.with(|owner| match *owner.borrow() {
        Some(principal) => principal == caller,
        None => false,
    })
}
pub fn set_config_map(key: String, value: String) {
    CONFIG_MAP.with(|map| {
        map.borrow_mut().insert(key, value);
    });
}
pub fn get_config_map_by_key(key: String) -> Option<String> {
    CONFIG_MAP.with(|map| {
        map.borrow().get(&key)
    })
}
pub fn get_upgrades_memory() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(UPGRADES))
}

pub fn get_stable_btree_memory() -> Memory {
    MEMORY_MANAGER.with(|m| m.borrow().get(STABLE_BTREE))
}