## KAOS-Draw
KAOS-Draw is a web application to enable the construction of graphical KAOS goal models.

## Motivation
KAOS goal modeling enables system designers to represent goal-oriented system requirements graphically. Through goal models, high-level functional objectives can be broken down hierachically into leaf-level system requirements. The KAOS-Draw tool exists as a user-interface to enable the construction of a KAOS goal model but also enables the translation of a goal model into a format that can be interpreted and evaluated automatically by software at run time.

## Implementation
- [user interface]
    - Javascript (ECMAScript 6) + HTML5
- [run-time evaluation]
    - Python 2.7

## Requirements
KAOS-Draw has only been tested and verified for use in either the Firefox and Chrome web browsers with the latest updates installed. Proper functionality cannot be guaranteed in other browsers.

## Features
Through the KAOS-Draw interface, a <i>Scalable Vector Graphic (SVG)</i> can be directly manipulated to enable the creation of a KAOS goal model. Users can create common KAOS elements such as <i>goals</i>, <i>obstacles</i>, and <i>agents</i>, and users can link such elements together with <i>refinements</i>. Once created, the SVG of a KAOS goal model can be saved locally by the user in the SVG format or exported into a JPEG image file. Only SVGs of existing KAOS goal models (made with KAOS-Draw) can be re-opened for further editing.

## Getting Started
The KAOS-Draw interface consists of three core areas for interaction. In the center of the interface, a gridded area acts as a drawing pane for the user to construct and manipulate the KAOS model. To the left, buttons are provided for the user to create each of the available KAOS elements. On the right, input fields will be provided for the user to view and edit properties associated with selected elements.

The name of the current model is displayed on the top-right. This name can be edited by the user and will determine the model's file name when saved. Links are provided below this field to enable the user to open an existing model, save the current model, or export the current model into a JPEG image format. (Note: When exporting to JPEGs, only the visible portion of the KAOS model will be drawn to the resulting image.)

On the left, buttons exist for the user to create KAOS model elements and refinements. Once a button has been pressed, the user can click anywhere in the gridded area to place the corresponding element. Once created, a user can select the new element by clicking anywhere inside of it. A collection of input fields will be displayed to the right side of the interface to enable the user to edit any properties associated with the selected element. For example, when creating a goal, the user can select the goal by clicking anywhere within the element's parallelogram graphic, and then, a description of the goal can be entered by typing in descriptive text in the "Description" input field displayed on the right. After a description has been entered, the graphic in the gridded area will be updated to display the new text.

Once multiple goals have been created, refinements can be made to link sub-goals to parent goals by clicking on the "Refinement" button, clicking on a sub-goal, and then dragging the cursor to the parent goal. Once the parent goal is highlighted, releasing the mouse button will create the refinement. To link a sub-goal to an existing refinement (i.e., to create an AND-Refinement), the user can first click on a sub-goal and then drag the cursor to an existing refinement arrow.

Elements can be moved by clicking anywhere on the element and dragging the cursor to a new location. The entire model can be moved by clicking anywhere outside of an element and dragging the cursor to a new location. The model can be expanded or shrunk by clicking on the "+" or "-" buttons on the left side of the interface. Finally, the model can be centered into view by clicking the "&oplus;" button.

