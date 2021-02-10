export class HPLink {
    constructor(path) {
        this.path = path;
    }
    getHTML() {
        let out = document.createElement('li');
        out.classList.add("homepage__link");
        let cells = this.path.split('/');
        out.innerHTML = `/${cells.slice(cells.length - 2).join('/<wbr>')}`; //.replace(/(?<!\\)_/g,' ').replace(/\_/g,'_')}`;
        out.addEventListener('click', () => {
            window.location.hash = this.path;
        });
        return out;
    }
}
//# sourceMappingURL=hplink.js.map