import {ControlType} from "./enums/controlType.ts";

/**
 * Represents a set of controls.
 */
export class Controls
{
    public forward: boolean = false;
    public left: boolean = false;
    public right: boolean = false;
    public reverse: boolean = false;

    /**
     * Constructor for Controls.
     * @param controlType - The type of controls to initialize.
     */
    constructor(controlType: ControlType)
    {
        switch (controlType)
        {
            case ControlType.DUMMY:
                this.forward = true;
                break;
            case ControlType.KEYS:
                this.addKeyboardListeners();
                break;
        }
    }

    /**
     * Private method to add keyboard event listeners for control input.
     */
    private addKeyboardListeners(): void
    {
        /**
         * Event handler for keydown events.
         * @param event - The keydown event object.
         */
        document.onkeydown = (event: KeyboardEvent) =>
        {
            switch (event.key)
            {
                case 'ArrowLeft':
                    this.left = true;
                    break;
                case 'ArrowRight':
                    this.right = true;
                    break;
                case 'ArrowUp':
                    this.forward = true;
                    break;
                case 'ArrowDown':
                    this.reverse = true;
                    break;
            }
        };

        /**
         * Event handler for keyup events.
         * @param event - The keyup event object.
         */
        document.onkeyup = (event: KeyboardEvent) =>
        {
            switch (event.key)
            {
                case 'ArrowLeft':
                    this.left = false;
                    break;
                case 'ArrowRight':
                    this.right = false;
                    break;
                case 'ArrowUp':
                    this.forward = false;
                    break;
                case 'ArrowDown':
                    this.reverse = false;
                    break;
            }
        };
    }
}
