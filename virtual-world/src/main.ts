import './style.css';
import {CarView} from "./view/carView.ts";

// new GraphEditView(`#app`, 600, 600);

new CarView(`#app`, window.innerWidth - 330, window.innerHeight);