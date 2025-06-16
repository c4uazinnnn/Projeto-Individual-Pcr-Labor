const http = require('http');

function testarServidor() {
  console.log('🧪 Testando se o servidor está rodando...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Servidor respondeu com status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('✅ Servidor está funcionando!');
      
      // Testar API de pedidos
      const apiOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/pedidos',
        method: 'GET'
      };
      
      const apiReq = http.request(apiOptions, (apiRes) => {
        console.log(`📋 API pedidos respondeu com status: ${apiRes.statusCode}`);
        
        let data = '';
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          try {
            const result = JSON.parse(data);
            console.log(`📊 API retornou: ${result.success ? 'sucesso' : 'erro'}`);
            if (result.data) {
              console.log(`📋 Pedidos encontrados: ${result.data.length}`);
            }
          } catch (e) {
            console.log(`❌ Erro ao parsear resposta da API: ${e.message}`);
            console.log(`📄 Resposta bruta: ${data.substring(0, 200)}...`);
          }
        });
      });
      
      apiReq.on('error', (err) => {
        console.error(`❌ Erro na API: ${err.message}`);
      });
      
      apiReq.end();
    }
  });
  
  req.on('error', (err) => {
    console.error(`❌ Servidor não está rodando: ${err.message}`);
  });
  
  req.end();
}

testarServidor();
