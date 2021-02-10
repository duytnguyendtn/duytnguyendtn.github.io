export class FolderComp {
    constructor(folder) {
        this.folder = folder;
    }
    getArticleIcon(title) {
        let fig = document.createElement('figure');
        fig.classList.add("icon");
        let icon = document.createElement('img');
        icon.src = "./style/assets/article.svg";
        let cap = document.createElement('figcaption');
        cap.textContent = title.replace(/(?<!\\)_/g, ' ').replace(/\_/g, '_');
        fig.append(icon, cap);
        fig.addEventListener('click', () => {
            window.location.hash = window.location.hash + title;
        });
        return fig;
    }
    getFolderIcon(title) {
        let fig = document.createElement('figure');
        fig.classList.add("icon");
        let icon = document.createElement('img');
        icon.src = "./style/assets/folder.svg";
        let cap = document.createElement('figcaption');
        cap.textContent = title.replace(/(?<!\\)_/g, ' ').replace(/\_/g, '_');
        fig.append(icon, cap);
        fig.addEventListener('click', () => {
            window.location.hash = window.location.hash + title + '/';
        });
        return fig;
    }
    getHTML() {
        let out = document.createElement('div');
        out.classList.add("folder");
        this.folder.f_order.forEach(key => {
            let icon = this.getFolderIcon(key);
            out.append(icon);
        });
        this.folder.a_order.forEach(key => {
            out.append(this.getArticleIcon(key));
        });
        return out;
    }
}
//# sourceMappingURL=folderComp.js.map