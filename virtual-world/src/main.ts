import './style.css';
import { CarTrainingView } from "./view/carTrainingView.ts";
import { GraphEditView } from "./view/graphEditView.ts";

const appElementName: string = `#app`;

const appElementRef: HTMLElement = document.querySelector(appElementName) as HTMLElement;

appElementRef.innerHTML =
    `
        <h1>Select an Option</h1>
        <div id="verticalButtons">
            <button id="graphEditButton">💾 Edit world</button>
            <button id="carTrainingButton">🚗 Train Car</button>
        </div>
    `;

const graphEditButton: HTMLButtonElement = document.getElementById('graphEditButton') as HTMLButtonElement;
const carTrainingButton: HTMLButtonElement = document.getElementById('carTrainingButton') as HTMLButtonElement;

graphEditButton.addEventListener('click', () => openGraphEditView());
carTrainingButton.addEventListener('click', () => openCarTrainingView());

function openGraphEditView(): void
{
    new GraphEditView(appElementName, 600, 600);
}

function openCarTrainingView() : void
{
    new CarTrainingView(appElementName, window.innerWidth - 330, window.innerHeight);
}
