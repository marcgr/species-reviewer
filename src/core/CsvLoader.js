const CsvLoader = ({
    targetDomElementId = '',
    onLoadHandler = ''
}={})=>{

    const isFileReaderAvailable = typeof window.FileReader === 'undefined' ? false : true;
    const tagetDomElement = targetDomElementId ? document.getElementById(targetDomElementId) : null

    const init = ()=>{
        
        if(!tagetDomElement){
            console.error(`Failed to init Csv Loader >>> target DOM element (${targetDomElementId}) for Csv Loade is not available`);
            return;
        }

        if(!isFileReaderAvailable){
            console.error('Failed to init Csv Loader >>> File Reader is not supported.');
            return;
        }

        initEventHandlers();

    };

    const initEventHandlers = ()=>{

        tagetDomElement.ondragover = ()=>{
            // console.log('ondragover');
            return false;
        };

        tagetDomElement.ondragend = ()=>{
            // console.log('ondragend');
            return false;
        };

        tagetDomElement.ondrop = (e)=>{

            // console.log('ondrop');

            e.preventDefault();

            const file = e.dataTransfer.files[0];

            const reader = new FileReader();

            reader.onload = (event)=>{
                const csvData = event.target.result;
                console.log(csvData);
            };

            reader.readAsText(file);

            return false;
        };

    };

    return {
        init
    };
    
};

export default CsvLoader;