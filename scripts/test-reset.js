// Test script to check localStorage state and reset functionality
// Run this in browser console to diagnose the reset issue

console.log('=== localStorage State Check ===');
const keys = [
  'chore-champ-users',
  'chore-champ-currentUser',
  'chore-champ-chores',
  'chore-champ-rewards',
  'chore-champ-requests',
  'chore-champ-notifications',
  'chore-champ-pin',
];

keys.forEach(key => {
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value ? 'EXISTS' : 'empty/none'}`);
  if (value) {
    console.log(`  Value: ${JSON.stringify(value).substring(0, 100)}...`);
  }
});

console.log('\n=== All localStorage keys ===');
Object.keys(localStorage)
  .filter(k => k.includes('chore-champ'))
  .sort()
  .forEach(key => console.log(`  - ${key}`));

console.log('\n=== Test Reset Function ===');
const testReset = () => {
  const keys = [
    'chore-champ-users',
    'chore-champ-currentUser',
    'chore-champ-chores',
    'chore-champ-rewards',
    'chore-champ-requests',
    'chore-champ-notifications',
    'chore-champ-pin',
  ];
  
  console.log('Before reset:');
  keys.forEach(key => {
    console.log(`  ${key}: ${localStorage.getItem(key) || 'empty'}`);
  });
  
  keys.forEach(key => localStorage.removeItem(key));
  
  console.log('After reset:');
  keys.forEach(key => {
    console.log(`  ${key}: ${localStorage.getItem(key) || 'empty'}`);
  });
  
  return keys.every(k => !localStorage.getItem(k));
};

console.log('Reset function works:', testReset());
