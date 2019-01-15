import './style.scss';

export default function(){

    let container = null;
    let onSubmitHandler = null;

    const init = (options={})=>{

        container = options.containerID ? document.getElementById(options.containerID) : null;
        onSubmitHandler = options.onSubmitHandler || null;

        const data = options.data || null;

        if(!container){
            console.error('containerID is required to init Overall Feedback Control');
            return;
        }

        render(data);
        initEventHandler();
    };

    const render = (data)=>{

        // const comment = data.comment || '';

        const compoenetHtml = `
            <div id='overallFeedbackControlPanelContainer' class='panel panel-black'>
                <div class="text-center">
                    <h4>Tell us how you like the model and app?</h4>
                </div>

                <div class="text-center">
                    <span class="icon-ui-favorites icon-ui-yellow icon-ui-flush"></span>
                    <span class="icon-ui-favorites icon-ui-yellow icon-ui-flush"></span>
                    <span class="icon-ui-favorites icon-ui-gray icon-ui-flush"></span>
                    <span class="icon-ui-favorites icon-ui-gray icon-ui-flush"></span>
                    <span class="icon-ui-favorites icon-ui-gray icon-ui-flush"></span>
                </div>

                <div class='leader-half'>
                    <label>
                        <span class='font-size--3'>feedback</span>
                        <textarea type="text" placeholder="" class="comment-textarea"></textarea>
                    </label>
                </div>

                <div class='leader-half trailer-half'>
                    <btn class='btn btn-fill'>Save</btn>
                </div>
            </div>
        `;

        container.innerHTML = compoenetHtml;
    };

    const initEventHandler = ()=>{

    };

    return {
        init
    };

}