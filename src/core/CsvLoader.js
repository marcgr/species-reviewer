const CsvLoader = ({
    targetDomElementId = '',
    onLoadHandler = null
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
                const csvString = event.target.result;
                const csvData = parseCsvString(csvString);

                if(onLoadHandler){
                    onLoadHandler(csvData);
                }
            };

            reader.readAsText(file);

            return false;
        };

    };

    const parseCsvString = (csvString='')=>{
        const csvRows = csvString.split('\n');

        const columns = csvRows[0].split(',').map(d=>{
            const isLatitude = d.match(/\b(latitude)\b|\b(lat)\b/gi) ? true : false;
            const isLongitude = d.match(/\b(longitude)\b|\b(lon)\b/gi) ? true : false;
            return {
                isLatitude,
                isLongitude,
                name: d
            }
        });

        const dataRows = csvRows.slice(1).map(d=>d.split(','));

        const features = dataRows.map((feature)=>{
            
            const attributes = {};
            const geometry = {};

            feature.forEach((attribute, index)=>{
                if(columns[index]){
                    const key = columns[index].name;
                    attributes[key] = attribute;

                    if(columns[index].isLongitude){
                        geometry.x = +attribute
                    }

                    if(columns[index].isLatitude){
                        geometry.y = +attribute
                    }
                }
            });

            if(geometry.x && geometry.y){
                geometry.type = 'point';
            }

            return {
                geometry,
                attributes
            };

        }).filter(d=>d.geometry.type);

        return {
            features
        };
    }

    return {
        init
    };
    
};

export default CsvLoader;