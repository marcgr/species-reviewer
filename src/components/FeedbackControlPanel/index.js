import './style.scss';

export default function FeedbackControlPanel(){

    let container = null;
    let onCloseHandler = null;
    let statusOnChange = null;
    let commentOnChange = null;
    let onSubmitHandler = null;
    let statusData = [];
    
    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;

        onCloseHandler = options.onCloseHandler || null;

        statusOnChange = options.statusOnChange || null;

        commentOnChange = options.commentOnChange || null;

        onSubmitHandler = options.onSubmitHandler || null;

        if(!container){
            console.error('containerID is required for FeedbackControlPanel');
            return;
        }

        // render();

        initEventHandler();
    };

    const render = (data={})=>{

        // console.log(data);

        const hucName = data.hucName || '';
        const comment = data.comment || '';
        const statusIdx = +data.status || 0;

        const radioBtns = statusData.map( (d, i)=>{
            const isChecked = i === statusIdx ? 'checked' : ''
            return `<label><input type="radio" name="status" value="${i}" ${isChecked}>${d}</label>`
        }).join('');

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
                        ${radioBtns}
                    </fieldset>
                </div>

                <div>
                    <label>
                        <span class='font-size--2'>Comment</span>
                        <textarea type="text" placeholder="" class="comment-textarea">${comment}</textarea>
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
        });

        container.addEventListener('click', function (event){
            if (event.target.type === 'radio') {
                // console.log('click radio btn', event.target.value);
                if(statusOnChange){
                    statusOnChange(event.target.value);
                }
            }
        });

        container.addEventListener('input', function (event){
            // console.log(event.target);
            if (event.target.classList.contains('comment-textarea')) { 
                // console.log('textarea on input', event.target.value);
                if(commentOnChange){
                    commentOnChange(event.target.value);
                }
            }
        });

        container.addEventListener('click', function (event){
            if (event.target.classList.contains('js-submit-feedback')) {
                // console.log('close feedback control panel');
                if(onSubmitHandler){
                    onSubmitHandler();
                }
            }
        });

    };

    const open = (data={})=>{
        render(data);
    };

    const close = ()=>{
        container.innerHTML = '';
    };

    const setStatusData = (data=[])=>{
        statusData = data;
        // console.log('setStatusData', statusData);
    };

    return {
        init,
        open,
        close,
        setStatusData
    };

}