import { toast } from 'sonner';

export default function ToastDebugger() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <button 
        onClick={() => {
          console.log('Botón React clickeado');
          window.alert('¡React está vivo! El evento de clic funciona.');
          toast.success('Prueba de React: ¡Funcionando!', {
            description: 'Si ves esta burbuja, React y Sonner están vinculados correctamente.',
            duration: 5000,
          });
        }}
        style={{
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
        }}
      >
        DIAGNÓSTICO REACT
      </button>
      <p style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>React 19 + Sonner 2.0</p>
    </div>
  );
}
