import React, { type ReactNode } from 'react';
// import backgroundImg from '../assets/background.jpg';

interface AuthLayoutProps {
    children: ReactNode;
    bgImage?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
                                                   children,
                                                   bgImage = ''
                                               }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >

            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    width: '100%',
                    maxWidth: '300px',
                    paddingLeft: '24px',
                    paddingRight: '24px'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;