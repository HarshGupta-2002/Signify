document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const brushColorInput = document.getElementById('brushColor');
    const bgColorInput = document.getElementById('bgColor');
    const brushThicknessInput = document.getElementById('brushThickness');
    const clearButton = document.getElementById('clear');
    const downloadButton = document.getElementById('download');
    const fileTypeSelect = document.getElementById('file');

    // Variables for drawing
    let drawing = false;
    let brushColor = brushColorInput.value;
    let brushThickness = brushThicknessInput.value;
    let bgColor = bgColorInput.value;

    // Set canvas dimensions based on parent container size
    function resizeCanvas() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        ctx.putImageData(imageData, 0, 0);
        setBackgroundColor(bgColor);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();  // Initial resize

    // Initial canvas background color
    function setBackgroundColor(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setBackgroundColor(bgColor);

    // Update brush color
    brushColorInput.addEventListener('input', (e) => {
        brushColor = e.target.value;
    });

    // Update background color
    bgColorInput.addEventListener('input', (e) => {
        bgColor = e.target.value;
        setBackgroundColor(bgColor);
    });

    // Update brush thickness
    brushThicknessInput.addEventListener('input', (e) => {
        brushThickness = e.target.value;
    });

    // Get the offset position of the canvas
    function getCanvasOffset() {
        const rect = canvas.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top
        };
    }

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function draw(e) {
        if (!drawing) return;
        const offset = getCanvasOffset();
        ctx.lineWidth = brushThickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = brushColor;

        ctx.lineTo(e.clientX - offset.left, e.clientY - offset.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - offset.left, e.clientY - offset.top);
    }

    function startDrawingTouch(e) {
        drawing = true;
        drawTouch(e);
    }

    function drawTouch(e) {
        if (!drawing) return;
        e.preventDefault(); // Prevent scrolling while drawing

        const offset = getCanvasOffset();
        const touch = e.touches[0];
        ctx.lineWidth = brushThickness;
        ctx.lineCap = 'round';
        ctx.strokeStyle = brushColor;

        ctx.lineTo(touch.clientX - offset.left, touch.clientY - offset.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(touch.clientX - offset.left, touch.clientY - offset.top);
    }

    function stopDrawing() {
        drawing = false;
        ctx.beginPath();
    }

    // Clear the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setBackgroundColor(bgColor);
    }

    // Save the canvas as an image or PDF
    function downloadCanvas() {
        const fileType = fileTypeSelect.value;
        let link = document.createElement('a');
        
        if (fileType === 'png' || fileType === 'jpg') {
            const imageFormat = fileType === 'png' ? 'image/png' : 'image/jpeg';
            link.href = canvas.toDataURL(imageFormat);
            link.download = `signature.${fileType}`;
            link.click();
        } else if (fileType === 'pdf') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";
            script.onload = () => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save('signature.pdf');
            };
            document.body.appendChild(script);
        }
    }

    // Event listeners for drawing with mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Event listeners for drawing with touch
    canvas.addEventListener('touchstart', startDrawingTouch);
    canvas.addEventListener('touchmove', drawTouch);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    // Event listener for clear button
    clearButton.addEventListener('click', clearCanvas);

    // Event listener for download button
    downloadButton.addEventListener('click', downloadCanvas);
});
