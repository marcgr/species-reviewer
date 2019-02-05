import './style.scss';

export default function FeedbackControlPanel(){

    let container = null;
    let onCloseHandler = null;
    // let statusOnChange = null;
    let commentOnChange = null;
    let onSubmitHandler = null;
    let onRemoveHandler = null;
    // let statusData = [];

    const state = {
        data: null,
        isSumbitCommentOnly: false
    };

    const statusLookup = {
        1: 'Add to Modeling Extent',
        2: 'Remove from Modeling Extent',
        3: 'Comment on Predicted Habitat'
    };
    
    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;

        onCloseHandler = options.onCloseHandler || null;

        // statusOnChange = options.statusOnChange || null;

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

    const initState = (data)=>{
        state.data = data;
        state.isSumbitCommentOnly = +state.data.status === 3 ? true : false;
    };

    const toggleIsSumbitCommentOnly = ()=>{
        state.isSumbitCommentOnly = !state.isSumbitCommentOnly;
    };

    const resetState = ()=>{
        state.data = null;
        state.isSumbitCommentOnly = false;
    };

    const getStatusByIsInModeledRange = ()=>{
        return state.data.isHucInModeledRange ? 2 : 1;
    }

    const getNewStatus = ()=>{
        if(state.isSumbitCommentOnly){
            return 3;
        } else {
            return getStatusByIsInModeledRange();
        }
    }

    const render = ()=>{

        const hucName = state.data.hucName || '';
        const comment = state.data.comment || '';
        // const statusIdx = +data.status || 0;
        // const message = data.isHucInModeledRange ? `Model is inaccurate, <span class='avenir-demi'>REMOVE</span> this HUC from range` : `Known occurances, <span class='avenir-demi'>ADD</span> this HUC to range`;

        const compoenetHtml = `
            <div id='feedbackControlPanelContainer' class='panel panel-black'>

                <div class='trailer-0 text-right close-btn'>
                    <span class='font-size--3 icon-ui-close js-close'></span>
                </div>

                <div class='leader-half trailer-half'>
                    <span class='font-size-0'>${hucName}</span>
                    <hr>
                </div>

                <div id='actionDialogWrap'>
                    ${getHtmlForActions()}
                </div>

                <div class='comment-dialog'>
                    <label>
                        <span class='font-size--3'>${getLabelForTextInput()}:</span>
                        <textarea type="text" placeholder="" class="comment-textarea">${comment}</textarea>
                    </label>
                </div>

                <div class='trailer-half'>
                    ${getHtmlForBtns(state.data.isSaved)}
                </div>
            </div>
        `;

        container.innerHTML = compoenetHtml;

        addSwitcherOnChangeHandler();

        // console.log('render feedback control panel', state.data);

    };

    // const refreshActionDialog = ()=>{
    //     document.getElementById('actionDialogWrap').innerHTML = getHtmlForActions();
    // };

    const getLabelForTextInput = ()=>{
        return state.isSumbitCommentOnly ? statusLookup[3] : 'Comment'
    }

    const getHtmlForActions = ()=>{

        const status = getStatusByIsInModeledRange();

        const isChecked = state.isSumbitCommentOnly ? '' : 'is-checked';

        // const outputHtml = `<div class='action-dialog trailer-half font-size--1 ${isChecked}'>
        //     <div class='inline-block'>
        //         <span class='icon-ui-checkbox-checked js-toggle-is-comment-only'></span>
        //         <span class='icon-ui-checkbox-unchecked js-toggle-is-comment-only'></span>
        //     </div>
        //     <span class='action-message'>${statusLookup[+status]}</span>
        // </div>`

        // const isChecked = state.isSumbitCommentOnly ? '' : 'checked';

        const outputHtml = `
            <div class='inline-block'>
                <label class="toggle-switch ${isChecked}">
                    <input type="checkbox" class="toggle-switch-input" ${state.isSumbitCommentOnly ? '' : 'checked'}>
                    <span class="toggle-switch-track margin-right-1"></span>
                    <span class="toggle-switch-label font-size--1 action-message">${statusLookup[+status]}</span>
                </label>
            </div>
        `;

        return outputHtml;
    }

    const getHtmlForBtns = (isSaved)=>{
        // const newStatus = isHucInModeledRange ? 2 : 1;
        const saveBtn = `<button class="btn btn-fill js-submit-feedback trailer-half"> Save </button>`;
        // const updateBtn = `<button class="btn btn-fill js-submit-feedback trailer-half"> Save </button>`;
        // const removeBtn = `<button class="btn btn-fill js-remove-feedback trailer-half"> Reset </button>`;

        const btnsForExistingItem = `
            <nav class='trailer-half'>
                <button class="btn btn-half btn-grouped btn-transparent js-remove-feedback"> Reset </button>
                <button class="btn btn-half btn-grouped js-submit-feedback"> Save </button>
            </nav>
        `;

        return isSaved ? btnsForExistingItem : saveBtn;
    };

    const addSwitcherOnChangeHandler = ()=>{
        container.querySelector('.toggle-switch-input').addEventListener('change', (evt)=>{
            console.log('toggle-switch-input on change');
            toggleIsSumbitCommentOnly();
            render();
        });
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
                // const newStatus = event.target.dataset.status || null;
                const newStatus = getNewStatus();
                if(onSubmitHandler){
                    onSubmitHandler(newStatus);
                }
            }  
            else if (event.target.classList.contains('js-remove-feedback')) {
                if(onRemoveHandler){
                    onRemoveHandler();
                }
            }
            // else if (event.target.classList.contains('js-toggle-is-comment-only')){
            //     toggleIsSumbitCommentOnly();
            //     render();
            // }
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
        initState(data);
        render();
    };

    const close = ()=>{
        resetState();
        container.innerHTML = '';
    };

    // const setStatusData = (data=[])=>{
    //     statusData = data;
    //     // console.log('setStatusData', statusData);
    // };

    return {
        init,
        open,
        close,
        // setStatusData
    };

}