(async ()=>{
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName: 'Test Node', ownerName: 'Node Owner', email: 'testnode@vyapaar.ai', password: 'password123' })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (err) {
    console.error('Request failed:', err);
  }
})();
