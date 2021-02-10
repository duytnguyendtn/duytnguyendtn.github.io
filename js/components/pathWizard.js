var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Article {
    constructor(url, pinned, mtime) {
        this.url = url;
        this.pinned = pinned;
        this.mtime = new Date(mtime);
    }
    static fromJSON(obj) {
        if (!obj['url']) {
            return null;
        }
        return new Article(obj['url'], obj['pinned'], obj['mtime']);
    }
}
export class Folder {
    constructor(f_order = [], a_order = [], folders = new Map(), articles = new Map()) {
        this.f_order = f_order;
        this.a_order = a_order;
        this.folders = folders;
        this.articles = articles;
    }
    static fromJSON(obj) {
        let folders = new Map();
        let articles = new Map();
        let f_order = obj['self']['f_order'];
        let a_order = obj['self']['a_order'];
        let pinned = [];
        let recent = [];
        for (let key of Object.keys(obj)) {
            let value = obj[key];
            let temp_art = Article.fromJSON(value);
            if (temp_art) {
                articles.set(key, temp_art);
                recent.push([`/${key}`, temp_art]);
                if (temp_art.pinned) {
                    pinned.push([`/${key}`, temp_art]);
                }
            }
            else {
                if (key !== 'self') {
                    let [nf, npin, nrec] = Folder.fromJSON(value);
                    folders.set(key, nf);
                    npin.forEach(([nkey, nvalue]) => {
                        nkey = `/${key}${nkey}`;
                        pinned.push([nkey, nvalue]);
                    });
                    nrec.forEach(([nkey, nvalue]) => {
                        nkey = `/${key}${nkey}`;
                        recent.push([nkey, nvalue]);
                    });
                }
            }
        }
        return [new Folder(f_order, a_order, folders, articles), pinned, recent];
    }
    get(path) {
        let cells = path.split("/").filter((str) => str !== "");
        if (cells.length === 1) {
            if (this.articles.has(cells[0])) {
                return this.articles.get(cells[0]);
            }
            else
                return undefined;
        }
        else {
            if (this.folders.has(cells[0])) {
                return this.folders.get(cells[0]).get(cells.slice(1).join("/"));
            }
            else if (cells[0] === ".") {
                return this.get(cells.slice(1).join("/"));
            }
            else
                return undefined;
        }
    }
    create(path, folder) {
        let cells = path.split("/");
        if (cells[cells.length - 1] === "") {
            if (cells.length === 2) {
                if (!this.folders.has(cells[0])) {
                    this.folders.set(cells[0], folder);
                }
                else {
                    console.error(`Folder, ${path}, already exists.`);
                }
            }
            else {
                if (this.folders.has(cells[0])) {
                    this.folders.get(cells[0]).create(cells.slice(1).join("/"), folder);
                }
                else if (cells[0] === ".") {
                    this.create(cells.slice(1).join("/"), folder);
                }
                else {
                    console.error(`No such folder: ${path}`);
                }
            }
        }
        else {
            console.error(`Path, ${path}, does not match Folder`);
        }
    }
    save(path, Article, overwrite = false) {
        let cells = path.split("/");
        if (cells[cells.length - 1] !== "") {
            if (cells.length === 1) {
                if (!this.articles.has(cells[0])) {
                    this.articles.set(cells[0], Article);
                }
                else if (overwrite) {
                    this.articles.set(cells[0], Article);
                }
                else {
                    console.error(`Article, ${path}, already exists. Set overwrite to true to continue.`);
                }
            }
            else {
                if (this.folders.has(cells[0])) {
                    this.folders.get(cells[0]).save(cells.slice(1).join("/"), Article, overwrite);
                }
                else if (cells[0] === ".") {
                    this.save(cells.slice(1).join("/"), Article, overwrite);
                }
                else {
                    console.error(`No such folder: ${path}`);
                }
            }
        }
        else {
            console.error(`Path, ${path}, does not match Article`);
        }
    }
    has(path) {
        let cells = path.split("/");
        let ffolder = cells[cells.length - 1] === "" || cells[cells.length - 1] === ".";
        if (cells.length === 1) {
            if (ffolder) {
                return true;
            }
            else {
                return this.articles.has(cells[0]);
            }
        }
        else {
            if (this.folders.has(cells[0])) {
                return this.folders.get(cells[0]).has(cells.slice(1).join("/"));
            }
            else if (cells[0] === "" || cells[0] === ".") {
                return this.has(cells.slice(1).join("/"));
            }
            else
                return false;
        }
    }
    open(path) {
        if (path === "" || path === "." || path === "./")
            return this;
        let cells = path.split("/");
        if (cells[0] === "" || cells[0] === ".") {
            cells = cells.slice(1);
        }
        if (cells[cells.length - 1] !== "" && cells[cells.length - 1] !== ".")
            return undefined;
        if (cells.length === 1) {
            return this;
        }
        else {
            if (this.folders.has(cells[0])) {
                return this.folders.get(cells[0]).open(cells.slice(1).join("/"));
            }
            else
                return undefined;
        }
    }
}
export class PathWizard {
    constructor(root = new Folder()) {
        this.root = root;
        this.pinned = [];
        this.recent = [];
    }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return window.fetch(new Request(url)).then(response => response.json()).then(json => {
                let [root, pinned, recent] = Folder.fromJSON(json);
                this.root = root;
                this.pinned = pinned;
                this.recent = recent.sort((a, b) => b[1].mtime.getTime() - a[1].mtime.getTime()).slice(0, 8);
            });
        });
    }
}
//# sourceMappingURL=pathWizard.js.map