import config from '../../config';

export default function SpeciesSelector(props={
    containerID: ''
}){

    const container = props.containerID ? document.getElementById(props.containerID) : null;

    let onChangeHandler = null;
    let data = null;
    let selectedTaxa = null;

    const init = (options={})=>{

        onChangeHandler = options.onChange || null;

        render();

        initEventHandler();
    };

    const getHtmlForTaxaSelector = ()=>{

        const taxa = [];

        data.forEach(d=>{
            if(taxa.indexOf(d[config.FIELD_NAME.speciesLookup.taxa] === -1)){
                taxa.push(d[config.FIELD_NAME.speciesLookup.taxa]);
            }
        })

        const optionsHtml = taxa.map(d=>{
            return `<option class='select-option' value="${d}">${d}</option>`
        }).join('');

        const taxaSelectorHtml = `
            <label class='trailer-half'>
                <select id='taxaSelector' class="select-full">
                    <option value="" selected disabled hidden>Select Taxa</option>
                    ${optionsHtml}
                </select>
            </label>
        `;
        
        return taxaSelectorHtml;
    };

    const getHtmlForSpeciesSelector = ()=>{

        const optionsHtml = data
            .filter(d=>{return d.Taxa === selectedTaxa})
            .map(d=>{
                const val = d[config.FIELD_NAME.speciesLookup.speciesCode];
                const label = d[config.FIELD_NAME.speciesLookup.speciesName];
                return `<option class='select-option' value="${val}">${label}</option>`
            }).join('');

        const speciesSelectorHtml = `
            <label class='trailer-half'>
                <select id='speciesSelector' class="select-full" ${ optionsHtml === '' ? 'disabled' : '' }>
                    <option value="" selected disabled hidden>Select Species</option>
                    ${optionsHtml}
                </select>
            </label>
        `;
        
        return speciesSelectorHtml;
    };

    const render = (options={
        data: []
    })=>{

        data = options.data || data;

        console.log(data);

        // const options = data.map(d=>{
        //     const val = d.SpeciesCode;
        //     const label = d.SpeciesName;
        //     return `<option class='select-option' value="${val}">${label}</option>`
        // }).join('');

        // const taxaSelectorHtml = `
        //     <label>
        //         <select class="select-full">
        //             <option value="" selected disabled hidden>Select Taxa</option>
        //         </select>
        //     </label>
        // `;

        const compoenetHtml = `
            <div id='taxaSelectorDiv'>
                ${getHtmlForTaxaSelector()}
            </div>
            <div id='speciesSelectorDiv'>
                ${getHtmlForSpeciesSelector()}
            </div>
        `;

        container.innerHTML = compoenetHtml;

    };

    const updateSpeciesSelector = ()=>{
        // console.log(getHtmlForSpeciesSelector());
        document.getElementById('speciesSelectorDiv').innerHTML = getHtmlForSpeciesSelector();
    }

    const initEventHandler = (options={})=>{

        // const changeEventHandler = (event)=>{
        //     if(event.target.value && onChangeHandler){
        //         onChangeHandler(event.target.value);
        //     }
        // };

        // const taxaSelectorOnChange = (event)=>{
        //     console.log(event.target.value);
        // };

        // container.querySelector('#speciesSelector').onchange = changeEventHandler;

        // container.querySelector('#taxaSelector').onchange = taxaSelectorOnChange;

        container.addEventListener('change', (evt)=>{

            const actionsByElementID = {
                'taxaSelector': ()=>{
                    // console.log('taxtSelector on change', event.target.value);
                    selectedTaxa = event.target.value;
                    updateSpeciesSelector();
                },
                'speciesSelector': ()=>{
                    // console.log('speciesSelector on change', event.target.value);
                    onChangeHandler(event.target.value);
                }
            };

            if(actionsByElementID[evt.target.id]){
                actionsByElementID[evt.target.id]();
            }
        })
    };

    return {
        init,
        render
    };

}