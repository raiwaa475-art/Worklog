import React from 'react';

const AnimatedBackground = () => {
    return (
        <div className="bg-decorations">
            <div className="mesh-gradient"></div>
            <div className="dot-pattern"></div>

            {/* Floating SVG Shapes */}
            <svg className="floating-svg" style={{ top: '15%', left: '10%', width: '150px', height: '150px', animationDelay: '0s' }} viewBox="0 0 200 200">
                <path fill="var(--primary)" d="M40,-62.1C53.3,-55.1,66.6,-45.7,73.5,-32.8C80.4,-19.9,80.9,-3.4,76.4,11.5C71.9,26.4,62.4,39.7,50.7,49.8C39,59.9,25.2,66.8,9.5,70.1C-6.2,73.4,-23.7,73.1,-37.9,65.8C-52.1,58.5,-63,44.1,-69.1,28.4C-75.2,12.7,-76.5,-4.4,-71.4,-19.3C-66.3,-34.2,-54.8,-46.9,-41.7,-54.1C-28.6,-61.3,-14.3,-63,0.3,-63.5C14.9,-64,26.7,-69.1,40,-62.1Z" transform="translate(100 100)" />
            </svg>

            <svg className="floating-svg" style={{ top: '65%', left: '80%', width: '200px', height: '200px', animationDelay: '-3s' }} viewBox="0 0 200 200">
                <path fill="var(--secondary)" d="M44.7,-76.4C58.3,-69.5,70,-58.5,78.2,-45.2C86.4,-31.9,91.1,-15.9,89.5,-0.9C87.9,14,80,28.1,70.5,40.1C61,52,49.9,61.8,36.9,69.5C23.9,77.2,9.1,82.8,-4.9,81.4C-18.9,80,-36.8,71.6,-50,60.8C-63.2,50,-71.6,36.8,-76.6,22.1C-81.6,7.4,-83.2,-8.8,-78.9,-23.1C-74.6,-37.4,-64.4,-49.8,-51.7,-57.2C-39,-64.6,-23.8,-67,-9.4,-65.4C5.1,-63.8,19.6,-58.2,31.2,-58.2C42.8,-58.2,51.5,-63.8,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>

            <svg className="floating-svg" style={{ top: '40%', left: '85%', width: '120px', height: '120px', animationDelay: '-7s' }} viewBox="0 0 200 200">
                <rect x="50" y="50" width="100" height="100" rx="20" fill="var(--accent)" transform="rotate(25 100 100)" />
            </svg>

            <div className="glow-spot" style={{ top: '20%', left: '30%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(100px)', opacity: '0.2' }}></div>
            <div className="glow-spot" style={{ top: '60%', left: '70%', width: '400px', height: '400px', background: 'var(--primary-glow)', filter: 'blur(100px)', opacity: '0.1' }}></div>
        </div>
    );
};

export default AnimatedBackground;
