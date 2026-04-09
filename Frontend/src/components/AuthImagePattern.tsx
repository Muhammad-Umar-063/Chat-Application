type AuthImagePatternProps = {
  title: string;
  subtitle: string;
};

const AuthImagePattern = ({ title, subtitle }: AuthImagePatternProps) => {
  const bubbles = [
    { text: "Hey there! 👋", delay: "0s", align: "left", top: "8%" },
    { text: "Hello! How are you?", delay: "-1s", align: "right", top: "22%" },
    { text: "I just joined FluxChat!", delay: "-2s", align: "left", top: "38%" },
    { text: "Welcome aboard 🎉", delay: "-0.5s", align: "right", top: "52%" },
    { typing: true, delay: "-1.5s", align: "left", top: "67%" },
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">

        {/* Bubble Container */}
        <div className="relative w-72 h-80 mx-auto mb-8">
          {bubbles.map((bubble, i) => (
            <div
              key={i}
              className={`absolute max-w-[60%] ${
                bubble.align === "right" ? "right-0" : "left-0"
              }`}
              style={{
                top: bubble.top,
                animation: `floatBubble 3s ease-in-out infinite`,
                animationDelay: bubble.delay,
              }}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                  bubble.align === "right"
                    ? "bg-primary text-primary-content rounded-br-sm"
                    : "bg-base-300 text-base-content rounded-bl-sm"
                }`}
              >
                {bubble.typing ? (
                  <div className="flex gap-1 items-center px-1 py-0.5">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="w-2 h-2 rounded-full bg-current block"
                        style={{
                          animation: "typingDot 1.2s ease-in-out infinite",
                          animationDelay: `${dot * 0.2}s`,
                          opacity: 0.5,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  bubble.text
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Keyframes */}
        <style>{`
          @keyframes floatBubble {
            0%, 100% { transform: translateY(0px) scale(1); opacity: 0.75; }
            50%       { transform: translateY(-8px) scale(1.03); opacity: 1; }
          }
          @keyframes typingDot {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40%           { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>

        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;