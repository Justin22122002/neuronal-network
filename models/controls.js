'use strict'

/** @class */
export class Controls
{
    /**
     * @constructor
     * @param {ControlType} controlType
     */
    constructor(controlType)
    {
        /** @member {boolean} */
        this.forward = false;
        /** @member {boolean} */
        this.left = false;
        /** @member {boolean} */
        this.right = false;
        /** @member {boolean} */
        this.reverse = false;

        switch (controlType)
        {
            case "DUMMY":
                this.forward = true;
                break;
            case "KEYS":
                this.#addKeyboardListeners();
                break;
        }
    }

    /**
     * Private method to add keyboard event listeners for control input.
     * @private
     * @return {void}
     */
    #addKeyboardListeners()
    {
        /**
         * Event handler for keydown events.
         * @param {KeyboardEvent} event - The keydown event object.
         * @return {void}
         */
        document.onkeydown = (event) =>
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
        }

        /**
         * Event handler for keyup events.
         * @param {KeyboardEvent} event - The keyup event object.
         * @return {void}
         */
        document.onkeyup = (event) =>
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
        }
    }

}