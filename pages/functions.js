function buttonHtml(id,content){
    return `<div id=${id} class="button"><a href="javascript:void(0)" class="buttonLink"><div class="butonText">${content}</div></a></div>`;
}

module.exports= {
    buttonHtml  : buttonHtml
};
