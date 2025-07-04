const mutation = `
  mutation ClearTestConversations {
    clearTestConversations
  }
`;

fetch('http://localhost:3001/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: mutation
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Test conversations cleared:', data);
  console.log('Please refresh your browser (F5)');
})
.catch(error => {
  console.error('❌ Error clearing conversations:', error);
}); 