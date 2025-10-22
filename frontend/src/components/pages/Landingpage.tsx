// --- LandingPage Component Code ---

import { Page } from '@/types';

// Image URLs (must be defined here for use in the single file)
const BackgroundImage = 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop';
const HandHoldingVote = 'https://placehold.co/320x320/98C49E/325732?text=VOTE+Civix';

// A clear interface for the component's props
interface LandingPageProps {
    onNavigate: (page: Page) => void;
}

const LandingPage = ({ onNavigate }: LandingPageProps) => {
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
            <div className="absolute inset-0 bg-[hsl(45_78%_90%)] opacity-70"></div> 

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0' }}>
                    <div className="text-2xl font-bold text-civix-dark-brown">Civix</div>
                    <nav className="hidden sm:flex space-x-8 text-civix-dark-brown font-medium">
                        <a href="#" className="hover:text-primary transition duration-150">Home</a>
                        <a href="#" className="hover:text-primary transition duration-150">About</a>
                        <a href="#" className="hover:text-primary transition duration-150">Petitions</a>
                        <a href="#" className="hover:text-primary transition duration-150">Contact</a>
                    </nav>
                    <div className="space-x-4">
                        <button onClick={() => onNavigate('login')} className="px-4 py-2 border border-border text-civix-dark-brown rounded-lg hover:bg-accent transition duration-150">Login</button>
                        <button onClick={() => onNavigate('signup')} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition duration-150">Sign Up</button>
                    </div>
                </header>

                <section className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-24 pb-12">
                    <div className="max-w-xl text-left animate-fade-in-slide" style={{ animationDelay: '0.2s' }}>
                        <h1 className="text-7xl font-extrabold leading-tight text-civix-dark-brown">
                            Your Voice. <br />Your Power. <br />Your Civix.
                        </h1>
                        <p className="mt-6 mb-8 text-xl text-civix-dark-brown/80 max-w-md">
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

                    <div className="relative mt-12 lg:mt-0 w-full max-w-xs flex justify-center lg:justify-end items-center animate-float">
                        <img 
                            src={HandHoldingVote} 
                            alt="Hand holding a vote sticker over a ballot." 
                            style={{ width: '16rem', height: '16rem', objectFit: 'cover', borderRadius: '9999px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', filter: 'saturate(0.5) sepia(0.3)' }} 
                        />
                        <div className="absolute top-1/4 right-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                    </div>
                </section>
            </div>
            {/* Footer Section */}
            <footer className="relative z-10 mt-16 pb-8 text-center text-civix-dark-brown">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center space-x-6 mb-4">
                        <a href="#" className="hover:text-primary transition-colors">Facebook</a>
                        <a href="#" className="hover:text-primary transition-colors">Twitter</a>
                        <a href="#" className="hover:text-primary transition-colors">Instagram</a>
                    </div>
                    <div className="flex justify-center space-x-6 mb-4 text-sm">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Civix. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

// FIXED: This line was missing, which caused the entire build process to fail.
export default LandingPage;
