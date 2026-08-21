import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const useTicketNotifications = () => {
    const soundRef = useRef(null);

    useEffect(() => {
        // Cargar el sonido
        soundRef.current = new Howl({
            src: ['/sounds/notification.mp3'],
            volume: 0.8,
            html5: true,
        });

        // Desbloquear audio en el primer clic del usuario
        const unlockAudio = () => {
            Howler.autoUnlock = true;
            Howler.usingWebAudio = true;
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);

        // Suscribirse al canal privado 'tickets'
        const channel = window.Echo.private('tickets');
        channel.listen('ticket.created', (data) => {
            // Reproducir sonido
            if (soundRef.current) {
                soundRef.current.play();
            }

            // Mostrar toast
            toast.info(
                `🎫 Nuevo ticket #${data.id} - ${data.title}\nCreado por: ${data.user_name} (${data.user_role})`,
                {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );

            console.log('Nuevo ticket recibido:', data);
        });

        // Limpieza al desmontar
        return () => {
            if (window.Echo) {
                window.Echo.leave('tickets');
            }
            if (soundRef.current) {
                soundRef.current.unload();
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);
};