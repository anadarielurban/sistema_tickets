import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { useTicketNotifications } from './hooks/useTicketNotifications';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    useTicketNotifications();

    return (
        <div>
        
            <div id="app-content">
                <h1>Sistema de Tickets</h1>
            </div>

            <ToastContainer />
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);