import './style.scss';

export default function SpeciesSelector(options={
    containerID: ''
}){

    const container = options.containerID ? document.getElementById(options.containerID) : null;

    let onChangeHandler = null

    const init = (options={})=>{

        onChangeHandler = options.onChange || null;

        // initEventHandler();

        render();
    };

    const render = (data=[])=>{

        // console.log(data);

        const optionsHtml = data.map(d=>{
            const val = d.SpeciesCode;
            const label = d.SpeciesName;
            return `<option class='select-option' value="${val}">${label}</option>`
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

        initEventHandler()

    };

    const initEventHandler = (options={})=>{

        const changeEventHandler = (event)=>{
            if(event.target.value && onChangeHandler){
                onChangeHandler(event.target.value);
            }
        };

        container.querySelector('select').onchange = changeEventHandler;
    };

    return {
        init,
        render
    };

}