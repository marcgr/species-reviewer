import './style.scss';

export default function FeedbackControlPanel(){

    let container = null;
    let onCloseHandler = null;
    let statusOnChange = null;
    let commentOnChange = null;
    let onSubmitHandler = null;
    let onRemoveHandler = null;
    let statusData = [];
    
    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;

        onCloseHandler = options.onCloseHandler || null;

        statusOnChange = options.statusOnChange || null;

        commentOnChange = options.commentOnChange || null;

        onSubmitHandler = options.onSubmitHandler || null;

        onRemoveHandler = options.onRemoveHandler || null;

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
        // const statusIdx = +data.status || 0;
        const message = data.isHucInModeledRange ? `Model is inaccurate, <span class='avenir-demi'>REMOVE</span> this HUC from range` : `Known occurances, <span class='avenir-demi'>ADD</span> this HUC to range`;

        // const radioBtns = statusData.map( (d, i)=>{
        //     const isChecked = i === statusIdx ? 'checked' : ''
        //     return `<label><input type="radio" name="status" value="${i}" ${isChecked}>${d}</label>`
        // }).join('');

        // const compoenetHtml = `
        //     <div id='feedbackControlPanelContainer' class='panel panel-black'>

        //         <div class='trailer-0 text-right close-btn'>
        //             <span class='font-size--3 icon-ui-close js-close'></span>
        //         </div>

        //         <div class='leader-half trailer-half'>
        //             <span class='font-size-0'>${hucName}</span>
        //             <hr>
        //         </div>

        //         <div class='trailer-half'>
        //             <fieldset class="fieldset-radio trailer-0">
        //                 <legend class='font-size--2'>Choose Status</legend>
        //                 ${radioBtns}
        //             </fieldset>
        //         </div>

        //         <div>
        //             <label>
        //                 <span class='font-size--2'>Comment</span>
        //                 <textarea type="text" placeholder="" class="comment-textarea">${comment}</textarea>
        //             </label>
        //         </div>

        //         <div class='trailer-half'>
        //             <button class="btn btn-fill js-submit-feedback"> Submit </button>
        //         </div>
        //     </div>
        // `;

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
                    <p class='font-size--2 trailer-half'>${message}</p>
                </div>

                <div>
                    <label>
                        <span class='font-size--3'>Comment:</span>
                        <textarea type="text" placeholder="" class="comment-textarea">${comment}</textarea>
                    </label>
                </div>

                <div class='trailer-half'>
                    ${getHtmlForBtns(data.isSaved, data.isHucInModeledRange)}
                </div>
            </div>
        `;

        container.innerHTML = compoenetHtml;

    };

    const getHtmlForBtns = (isSaved, isHucInModeledRange)=>{
        const newStatus = isHucInModeledRange ? 2 : 1;
        const saveBtn = `<button class="btn btn-fill js-submit-feedback trailer-half" data-status='${newStatus}'> Save </button>`;
        const updateBtn = `<button class="btn btn-fill js-submit-feedback trailer-half"> Update Feedback </button>`;
        const removeBtn = `<button class="btn btn-fill js-remove-feedback trailer-half"> Remove Feedback </button>`;

        return isSaved ? updateBtn + removeBtn : saveBtn;
    };

    const initEventHandler = ()=>{

        container.addEventListener('click', function (event){
            if (event.target.classList.contains('js-close')) {
                // console.log('close feedback control panel');
                if(onCloseHandler){
                    onCloseHandler();
                }
            }  
            else if (event.target.classList.contains('js-submit-feedback')) {
                // console.log('close feedback control panel');
                const newStatus = event.target.dataset.status || null;
                if(onSubmitHandler){
                    onSubmitHandler(newStatus);
                }
            }  
            else if (event.target.classList.contains('js-remove-feedback')) {
                if(onRemoveHandler){
                    onRemoveHandler();
                }
            }
            else {
                //
            }
        });

        // container.addEventListener('click', function (event){
        //     if (event.target.type === 'radio') {
        //         // console.log('click radio btn', event.target.value);
        //         if(statusOnChange){
        //             statusOnChange(event.target.value);
        //         }
        //     }
        // });

        container.addEventListener('input', function (event){
            // console.log(event.target);
            if (event.target.classList.contains('comment-textarea')) { 
                // console.log('textarea on input', event.target.value);
                if(commentOnChange){
                    commentOnChange(event.target.value);
                }
            }
        });

        // container.addEventListener('click', function (event){
        //     if (event.target.classList.contains('js-submit-feedback')) {
        //         // console.log('close feedback control panel');
        //         const newStatus = event.target.dataset.status || null;
        //         if(onSubmitHandler){
        //             onSubmitHandler(newStatus);
        //         }
        //     }
        // });

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