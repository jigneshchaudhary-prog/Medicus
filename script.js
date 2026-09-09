document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Live Command Center Simulation (Ticker)
    const liveConsults = document.getElementById('live-consults');
    if(liveConsults) {
        let consults = 842;
        setInterval(() => {
            if(Math.random() > 0.5) {
                consults += 1;
                liveConsults.innerText = consults.toLocaleString();
            }
        }, 2500);
    }

    // 2. Dashboard Graph Animation (Revenue Simulation)
    const graphBar = document.getElementById('live-graph-bar');
    if(graphBar) {
        setTimeout(() => {
            graphBar.style.height = "100%";
            graphBar.setAttribute("data-val", "₹32L");
        }, 1500);
    }

    // 3. Interactive Stepper Logic ("How it runs" section)
    const stepBtns = document.querySelectorAll('.step-btn');
    const stepPanels = document.querySelectorAll('.step-panel');

    if(stepBtns.length > 0) {
        stepBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                stepBtns.forEach(b => b.classList.remove('active'));
                stepPanels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked button and corresponding panel
                btn.classList.add('active');
                stepPanels[index].classList.add('active');
            });
        });
    }
});