import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    "Automated Word Cards",
    "Social Media Posts", 
    "Story Generation",
    "Tweet Templates",
    "Content Scheduling"
  ];

  const options = [
    { name: "Post 1", path: "/post1", description: "Generate engaging social media posts" },
    { name: "Post 2", path: "/post2", description: "Create formatted content cards" },
    { name: "Post 3", path: "/post3", description: "Design visual story templates" },
    { name: "Story 1", path: "/story1", description: "Build vocabulary word cards" },
    { name: "Story 2", path: "/story2", description: "Generate narrative content" },
    { name: "Story 3", path: "/story3", description: "Create story visualizations" },
    { name: "Tweet", path: "/tweet", description: "Craft perfect tweet formats" },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Brand Header */}
        <div className="text-center mb-12 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
              UNBOUNDED RAJ
            </h1>
            <div className="h-1 w-32 bg-black mx-auto animate-pulse"></div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-light mb-6 text-gray-700">
            Content Automation Platform
          </h2>
          
          <div className="h-8 mb-8">
            <p className="text-lg text-gray-600 transition-all duration-500">
              Streamlining <span className="font-semibold border-b-2 border-gray-300 transition-all duration-500">
                {features[currentFeature]}
              </span>
            </p>
          </div>
          
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Automate your content creation process with intelligent templates and generators. 
            From social media posts to educational content, create professional materials in seconds.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-8 mb-12 text-center">
          <div className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
            <div className="text-3xl font-bold">7+</div>
            <div className="text-sm text-gray-600">Content Types</div>
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
            <div className="text-3xl font-bold">∞</div>
            <div className="text-sm text-gray-600">Possibilities</div>
          </div>
          <div className="animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
            <div className="text-3xl font-bold">1-Click</div>
            <div className="text-sm text-gray-600">Generation</div>
          </div>
        </div>

        {/* Content Tools Grid */}
        <div className="w-full max-w-5xl">
          <h3 className="text-xl font-semibold text-center mb-8 text-gray-800">
            Choose Your Content Tool
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {options.map((opt, idx) => (
              <Link
                key={idx}
                to={opt.path}
                className="group p-6 border-2 border-gray-200 rounded-lg text-center hover:border-black hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white"
                style={{ 
                  animationDelay: `${idx * 0.1}s`,
                  animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="mb-3">
                  <h4 className="text-lg font-bold group-hover:scale-105 transition-transform duration-200">
                    {opt.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                  {opt.description}
                </p>
                <div className="mt-4 w-8 h-0.5 bg-gray-300 mx-auto group-hover:w-12 group-hover:bg-black transition-all duration-300"></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Process Flow */}
        <div className="mt-16 max-w-4xl w-full">
          <h3 className="text-xl font-semibold text-center mb-8 text-gray-800">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-black group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-bold">1</span>
              </div>
              <h4 className="font-semibold mb-2">Select Tool</h4>
              <p className="text-sm text-gray-600">Choose your content type</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-black group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-bold">2</span>
              </div>
              <h4 className="font-semibold mb-2">Input Data</h4>
              <p className="text-sm text-gray-600">Provide your content details</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 border-2 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:border-black group-hover:scale-110 transition-all duration-300">
                <span className="text-xl font-bold">3</span>
              </div>
              <h4 className="font-semibold mb-2">Generate & Export</h4>
              <p className="text-sm text-gray-600">Download your creation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <div className="text-sm text-gray-500">
          <p>© 2025 Unbounded Raj • Content Automation Platform</p>
          <p className="mt-1">Streamlining creativity, one template at a time.</p>
        </div>
      </footer>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
    </div>
  );
}