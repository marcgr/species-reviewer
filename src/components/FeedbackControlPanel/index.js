import './style.scss';

export default function FeedbackControlPanel(){

    let container = null;
    let onCloseHandler = null;

    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;

        onCloseHandler = options.onCloseHandler || null;

        if(!container){
            console.error('containerID is required for FeedbackControlPanel');
            return;
        }

        // render();

        initEventHandler();
    };

    const render = (data={})=>{

        const hucName = data.hucName || '';

        const compoenetHtml = `
            <div id='feedbackControlPanelContainer' class='panel panel-black'>

                <div class='trailer-0 text-right close-btn'>
                    <span class='font-size--3 icon-ui-close js-close'></span>
                </div>

                <div class='leader-half trailer-half'>
                    <span class='font-size-0'>${hucName}</span>
                    <hr>
                </div>

                <div class='trailer-half'>
                    <fieldset class="fieldset-radio trailer-0">
                        <legend class='font-size--2'>Choose Status</legend>
                        <label><input type="radio" name="status" value="0">Modeled In Range Modeled Extent</label>
                        <label><input type="radio" name="status" value="1">Add - Known Occurances</label>
                        <label><input type="radio" name="status" value="2">Remove - Model is Inaccurate</label>
                    </fieldset>
                </div>

                <div>
                    <label>
                        <span class='font-size--2'>Comment</span>
                        <textarea type="text" placeholder="" class=""></textarea>
                    </label>
                </div>

                <div class='trailer-half'>
                    <button class="btn btn-fill js-submit-feedback"> Submit </button>
                </div>
            </div>
        `;

        container.innerHTML = compoenetHtml;

    };

    const initEventHandler = ()=>{

        container.addEventListener('click', function (event){
            if (event.target.classList.contains('js-close')) {
                // console.log('close feedback control panel');
                if(onCloseHandler){
                    onCloseHandler();
                }
            }
        })

    };

    const open = (data={})=>{
        render(data);
    };

    const close = ()=>{
        container.innerHTML = '';
    };

    return {
        init,
        open,
        close
    };

}