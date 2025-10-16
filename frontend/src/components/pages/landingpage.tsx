// --- LandingPage Component Code ---

import { Page } from "@/App";

// Image URLs (must be defined here for use in the single file)
const BackgroundImage = 'http://googleusercontent.com/image_collection/image_retrieval/12626737598021126160_0';
const HandHoldingVote = 'https://placehold.co/320x320/98C49E/325732?text=VOTE+Civix';

const LandingPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
    // Injecting keyframes for custom animations (Still using CSS animations via style tag)
    const style = `
        @keyframes fadeInSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseShadow {
            0% { box-shadow: 0 0 0 0px hsl(var(--primary) / 0.4); }
            70% { box-shadow: 0 0 0 10px hsl(var(--primary) / 0); }
            100% { box-shadow: 0 0 0 0px hsl(var(--primary) / 0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-fade-in-slide {
            animation: fadeInSlide 1s ease-out forwards;
        }
        .animate-pulse-shadow {
            animation: pulseShadow 2s infinite;
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
    `;

    return (
        <div 
            className="min-h-screen bg-cover bg-center relative"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            <style>{style}</style>
            {/* Using arbitrary values or a class that closely matches the light overlay color */}
            <div className="absolute inset-0 bg-[hsl(45_78%_90%)] opacity-70"></div> 

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* HEADER: Using inline flex/justify-between for GUARANTEED layout */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0' }}>
                    <div className="text-2xl font-bold text-foreground">Civix</div>
                    <nav className="hidden sm:flex space-x-8 text-foreground font-medium">
                        <a href="#" className="hover:text-primary transition duration-150">Home</a>
                        <a href="#" className="hover:text-primary transition duration-150">About</a>
                        <a href="#" className="hover:text-primary transition duration-150">Petitions</a>
                        <a href="#" className="hover:text-primary transition duration-150">Contact</a>
                    </nav>
                    <div className="space-x-4">
                        <button onClick={() => onNavigate('login')} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition duration-150">Login</button>
                        <button onClick={() => onNavigate('signup')} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition duration-150">Sign Up</button>
                    </div>
                </header>

                {/* MAIN HERO SECTION: Using inline flex/justify-between for GUARANTEED layout */}
                <main style={{ paddingTop: '6rem', paddingBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }} className="lg:flex-row">
                    {/* Left Text Content */}
                    <div className="max-w-xl text-left animate-fade-in-slide" style={{ animationDelay: '0.2s' }}>
                        {/* Headline: Using inline font size for GUARANTEED sizing */}
                        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1' }} className="text-foreground">
                            Your Voice. <br />Your Power. <br />Your Civix.
                        </h1>
                        <p className="mt-6 mb-8 text-xl text-foreground max-w-md">
                            Engage in petitions, polls, and civic discussions that matter to your community.
                        </p>
                        <button 
                            onClick={() => onNavigate('signup')} 
                            className="px-8 py-3 bg-foreground text-background text-lg font-semibold rounded-lg shadow-xl hover:bg-foreground/90 transition duration-200 flex items-center w-fit animate-pulse-shadow"
                        >
                            Get Started
                            <span className="ml-2 text-xl">—</span>
                        </button>
                    </div>

                    {/* Right Image/Graphic Area - Fixed Sizing and positioning */}
                    <div className="relative mt-12 w-full max-w-xs flex justify-center lg:justify-end items-center animate-float" style={{ marginTop: '3rem' }}>
                        <img 
                            src={HandHoldingVote} 
                            alt="Hand holding a vote sticker over a ballot." 
                            style={{ width: '16rem', height: '16rem', objectFit: 'cover', borderRadius: '9999px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', filter: 'saturate(0.5) sepia(0.3)' }} 
                        />
                        {/* Floating Icon 1 (Top Right) */}
                        <div className="absolute top-1/4 right-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};