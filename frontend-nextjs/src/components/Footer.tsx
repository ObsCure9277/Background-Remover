'use client';

export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© 2025 CleanLayer. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>Powered by</span>
              <a 
                href="https://github.com/xuebinqin/U-2-Net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                U²-NET (U-Square Network)
              </a>
            </div>
          </div>

            <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>Developed by</span>
              <a 
                href="https://github.com/ObsCure9277/Background-Remover/tree/main?tab=readme-ov-file" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
              >
                Ng Shen Zhi
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
