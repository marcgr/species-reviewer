import './style.scss';

export default function SpeciesSelector(){

    let container = null;
    let onChangeHandler = null;

    const classNameSpeciesSelectOption = 'species-select-option';

    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;
        onChangeHandler = options.onChange || null;

        const data = options.data || null;

        if(!container || !data){
            console.error('containerID and data is required for SpeciesSelector', container, data);
            return;
        }

        render(data);
        initEventHandler();
    };

    const render = (data)=>{

        const optionsHtml = data.map(d=>{
            const val = d.SpeciesTableID;
            const label = d.Species;
            return `<option class='${classNameSpeciesSelectOption}' value="${val}">${label}</option>`
        }).join('');

        const compoenetHtml = `
            <div id='speciesSelectorContainer'>
                <label>
                    <select class="select-full">
                        <option value="" selected disabled hidden>Select Species</option>
                        ${optionsHtml}
                    </select>
                </label>
            </div>
        `;

        container.innerHTML = compoenetHtml;

    };

    const initEventHandler = ()=>{

        const changeEventHandler = (event)=>{
            if(event.target.value && onChangeHandler){
                onChangeHandler(event.target.value);
            }
        };

        container.querySelector('select').onchange = changeEventHandler;
    };

    return {
        init
    };

}