import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React from 'react';
import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';

function generateUID() {
  // I generate the UID from two parts here 
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
  // return Date.now()
}



/**
* This function handles any changes to the GoJS model.
* It is here that you would make any updates to your React state, which is discussed below.
*/

function handleModelChange(e) {
  alert(e);
}

function App() {
  const [nodeDataArray, setNodeDataArray] = useState([
    {
      key: generateUID(),
      value: "Alpha",
      loc: "0 0",
      x: 0,
      y: 0,
      location: 'root',
      hasLeft: false,
      hasRight: false
    },
  ])

  const [myModel, setMyModel] = useState({
    "class": "GraphLinksModel",
    "linkKeyProperty": "key",
    "nodeDataArray": [
      {
        "key": 0,
        "value": "Alpha",
        "loc": "0 0",
        "x": 0,
        "y": 0,
        "location": "root",
        "hasLeft": false,
        "hasRight": false
      }
    ],
    "linkDataArray": []
  })
  const [linkDataArray, setLinkDataArray] = useState([])
  const [parent, setParent] = useState('')
  const [nodeVal, setNodeVal] = useState('')
  const [preorderTravese, setPreOrderTraverse] = useState([]);

  const [modelData, setModelData] = useState({});

  const [dir, setDir] = useState("left")

  function preorderTraversal() {

    const tree = modelData.nodeDataArray.map((i) => {
      return (i);
    })
    const rootNode = tree[0];
    const visited = new Set();
    const result = [];

    console.log("tree", tree)

    const diagram = initDiagram();

    function highlightNode(nodeKey) {
      const node = diagram.findNodeForKey(nodeKey);
      if (node) {
        node.isHighlighted = true;
        // you can also change the color or other properties of the node
      }
    }

    function traverse(node) {
      if (!node || visited.has(node.key)) {
        return;
      }

      highlightNode(node.key);

      console.log(diagram.model.nodeDataArray)

      visited.add(node.key);
      result.push(node.value);

      if (node.hasLeft) {
        const leftNode = tree.find(n => n.parent === node.value && n.location === 'left');
        console.log("leftNode,", leftNode)
        traverse(leftNode);
      }
      if (node.hasRight) {
        const rightNode = tree.find(n => n.parent === node.value && n.location === 'right');
        console.log("rightNode,", rightNode)

        traverse(rightNode);
      }

      setTimeout(() => {
        const node2 = diagram.findNodeForKey(node.key);
        if (node2) {
          node2.isHighlighted = false;
          // you can also reset any other properties that you changed
        }
      }, 1000);

    }

    traverse(rootNode);

    setPreOrderTraverse(result);
  }


  function highlightNode(nodeKey) {
    const node = diagram.findNodeForKey(nodeKey);
    if (node) {
      node.isHighlighted = true;
      // you can also change the color or other properties of the node
    }
  }



  const handleChange = (e) => {
    setDir(e.target.value)
  }

  function initDiagram() {
    const $ = go.GraphObject.make;
    // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";

    var roundedRectangleParams = {
      parameter1: 2,  // set the rounded corner
      spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight  // make content go all the way to inside edges of rounded corners
    };

    const diagram =
      $(go.Diagram, {
        initialContentAlignment: go.Spot.Top,
        'undoManager.isEnabled': true
      });

    // diagram.nodeTemplate =
    //   $(go.Node, "Auto",
    //     new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    //     $(go.Shape, "Rectangle", { fill: "white" }),
    $(go.TextBlock, { margin: 10 },
      { editable: true, isMultiline: false },
      new go.Binding("text", "value").makeTwoWay()),
      //   );

      diagram.nodeTemplate =
      $(go.Node, "Spot",
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Auto",
          $(go.Shape, "Rectangle",
            { fill: "gold", name: "SHAPE" }),
          $(go.TextBlock, { margin: 10 },
            { editable: true, isMultiline: false },
            new go.Binding("text", "value").makeTwoWay()),
        ),
        $("TreeExpanderButton",
          { alignment: go.Spot.Bottom },
          { visible: true })
      );


    diagram.linkTemplate =
      $(go.Link,
        { routing: go.Link, corner: 5 },
        $(go.Shape));

    diagram.nodeTemplate.selectionAdornmentTemplate =
      $(go.Adornment, "Spot",
        $(go.Panel, "Auto",
          $(go.Shape, "RoundedRectangle", roundedRectangleParams,
            { fill: null, stroke: "#7986cb", strokeWidth: 3 }),
          $(go.Placeholder)  // a Placeholder sizes itself to the selected Node
        ),
        // the button to create a "next" node, at the top-right corner
        $("Button",
          {
            alignment: go.Spot.BottomLeft,
            click: addNodeLeft  // this function is defined below
          },
          new go.Binding("visible", "", function (data) {
            // Return true or false based on the condition of the node data
            if (data.hasLeft) {
              return false; // hide the button
            } else {
              return true; // show the button
            }
          }),
          $(go.Shape, "PlusLine", { width: 6, height: 6 })
        ),
        // $("TreeExpanderButton", { alignment: go.Spot.Bottom, alignmentFocus: go.Spot.Top }, { visible: true }),
        $("Button",
          {
            alignment: go.Spot.BottomRight,
            click: addNodeRight  // this function is defined below
          },
          new go.Binding("visible", "", function (data) {
            // Return true or false based on the condition of the node data
            if (data.hasRight) {
              return false; // hide the button
            } else {
              return true; // show the button
            }
          }),
          $(go.Shape, "PlusLine", { width: 6, height: 6 })
        ) // end button
      );

    // diagram.nodeTemplate.findObject("BUTTON").bind("visible", "", function (button, target) {
    //   var node = target.part; // Get the node data context
    //   var linkCount = node.linksConnected.count; // Get the number of links connected to the node
    //   var data = node.data; // Get the node data object // Replace with your own condition based on node data
    //   return !data.hasLeft; // Set the button visibility based on the number of links and the condition
    // });

    diagram.addDiagramListener("ObjectSingleClicked", function (e) {
      var part = e.subject.part;
      if (!(part instanceof go.Link)) {
        var data = part.data;
        setParent(data.value);
      }
    });

    diagram.addDiagramListener("SelectionDeleting", function (e) {
      console.log("deleted");
      var node = e.subject.first();
      console.log("node data", node.data);
      var parentNode = node.findTreeParentNode();
      var parentValue = (parentNode !== null) ? parentNode.data.value : null;
      if (node.data.location == "left") {
        parentNode.data.hasLeft = false
      }
      else {
        parentNode.data.hasRight = false
      }
      console.log("Deleting node with parent value: " + parentValue);
    });

    function addNodeLeft(e, obj) {
      console.log(obj)
      var node = obj.part;
      var data = node.data;
      data.hasLeft = true
      console.log(data)
      const toId = generateUID();
      obj.visible = !data.hasLeft;
      //position of new node
      let currX, currY;
      currX = data.x - 100;
      currY = data.y + 50;
      console.log(currX, currY);
      let x = currX.toString();
      let y = currY.toString();
      var loc = x + ' ' + y;

      //Adding New Node
      diagram.startTransaction("Add Node");
      var newnode = { key: data.key * 2 + 1, value: data.key* 2 + 1, parent: data.value, loc: loc, x: currX, y: currY, location: "left", hasLeft: false, hasRight: false };
      var linkData = { from: data.key, to: data.key * 2 + 1 }
      diagram.model.addNodeData(newnode);
      diagram.model.addLinkData(linkData);
      diagram.commitTransaction("Add Node");
    }

    function addNodeRight(e, obj) {
      console.log(obj)
      var node = obj.part;
      var data = node.data;
      data.hasRight = true
      console.log(data)
      const toId = generateUID();
      obj.visible = !data.hasRight;

      //position of new node
      let currX, currY;
      currX = data.x + 100;
      currY = data.y + 50;
      console.log(currX, currY);
      let x = currX.toString();
      let y = currY.toString();
      var loc = x + ' ' + y;

      //Adding New Node
      diagram.startTransaction("Add Node");
      var newnode = { key: data.key * 2 + 2, value: data.key* 2 + 2, parent: data.value, loc: loc, x: currX, y: currY, location: "right" };
      var linkData = { from: data.key, to: data.key * 2 + 2 }
      diagram.model.addNodeData(newnode);
      diagram.model.addLinkData(linkData);
      diagram.commitTransaction("Add Node");
    }

    load(diagram);

    return diagram;
  }

  function load(diagram) {
    diagram.model = go.Model.fromJson(myModel);
  }

  const getData = () => {
    const diagram = initDiagram()
    const myModel2 = JSON.parse(diagram.model.toJson());
    console.log(myModel2)
    // diagram.isModified = false;
  }

  const diagramRef = React.useRef()

  const handleModelChange = (event) => {
    const diagram = diagramRef.current.getDiagram();
    const jsonData = JSON.parse(diagram.model.toJson());
    setMyModel(diagram.model.toJson())
    setModelData(jsonData);
    console.log(jsonData)
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      // backgroundColor: "#9c9c9c",
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{
        margin: 10,
        width: '50%'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* <input onChange={(e) => setParent(e.target.value)} placeholder='parent' /> */}
          <button onClick={() => { handleModelChange() }}>Save Data</button>
          <button style={{
            marginTop: 10
          }} onClick={() => { preorderTraversal() }}>PreOrder Traversal</button>
        </div>
        <div style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: "center",
        }}>
          <h6 style={{
            textAlign: 'center'
          }}>1. Select a Node</h6>
          <h6 style={{
            textAlign: 'center'
          }}>2. Add A Children Left or Right</h6>
          <h6 style={{
            textAlign: 'center'
          }}>3. Delete A Node using "DEL" Key on the Keyboard</h6>
        </div>
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: "center",
        }}>
          {preorderTravese.length > 0 ? <h6>Pre Order Traversal</h6> : null}

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-evenly',
            borderStyle: 'solid',
            borderColor: '#000',
            borderWidth: 1,
            borderRadius: 10
          }}>
            {
              preorderTravese.map((i) => {
                return (
                  <p>{i} </p>
                )
              })
            }
          </div>
        </div>
      </div>

      <ReactDiagram
        ref={diagramRef}
        initDiagram={initDiagram}
        divClassName='diagram-component'
      />
    </div >
  )
}

export default App