import React, {useEffect, useState} from "react";
import ButtonNext from '../../Scene-component/ButtonNext';
import ButtonChoice from '../../Scene-component/ButtonChoice';
import Description from '../../Scene-component/Description';
import Timer from '../../Scene-component/Timer';
import KeywordDisplay from '../../Scene-component/Keyword-display/KeywordDisplay';
import HealthBar from '../../Scene-component/HealthBar';

import {webSocket} from '../../../webSocket';

const classNames = require('classnames');

export default function SubwayThird(props) {
  const [show, setShow] = useState(false)
  const sceneDescription = "Leaving the station behind, the tunnel is cold, dark, and quiet. After walking for some time, you stop short as you hear a groan from the darkness ahead. Unsure of its origin, you both extend your awareness, trying to sense what danger might lurk there…";

  function usePuzzleToChoices(initial) {
    const [history, setHistory] = useState([initial]);
  
    function transition(changeMode, replace = false) {
      setHistory(prev => {
        if (replace) {
          return [changeMode, ...prev.slice(1)];
        } else {
          return [changeMode, ...prev];
        }
      });
    }
  
    function back() {
      setHistory(prev => {
        if (prev.length > 1) {
          return prev.slice(1);
        } else {
          return prev;
        }
      });
    }
  
    return {mode: history[0], transition, back };
  }
  const PUZZLE = 'Puzzle'
  const CHOICES = 'Choices'
  const styleShow = show ? {} : {visibility: 'hidden'}
  const { mode, transition } = usePuzzleToChoices('Puzzle')

  const [path, setPath] = useState(false)
  const buttonClass = classNames("button", {
    "correct-path": path,
  });

  useEffect(() => {
    webSocket.on('puzzle to choices', (message) => {
      transition(message);
    });
  
    webSocket.on('show best path', (message) => {
      setPath(message)
    });

    webSocket.on('show', (message) => {
      setShow(message);
    });

    return function cleanup() {
      webSocket.off('puzzle to choices');
      webSocket.off('show best path');
      webSocket.off('show');
    }
  }, [])

  return (
    <div className='scene-layout'>
      {show ?
        <Timer
        socketPuzzleToChoices={props.socketPuzzleToChoices}
        socketSceneTransition={props.socketSceneTransition}

        ></Timer> : <div className='timer-dummy'></div>}

      <div style={styleShow} className='show-animation'>
        <div className='heart-right'>
          {<HealthBar
            style={styleShow}
            heart={props.heart}
          ></HealthBar>}
        </div>
      </div>
      <Description 
        className='descripton-layout' 
        text={sceneDescription} 
        maxLen={55}

        socketSetShow={props.socketSetShow}
      ></Description>
      {mode === PUZZLE &&
        <div style={styleShow} className='show-animation'>
          {<KeywordDisplay
          keyword={'protect'}
          style={styleShow}

          socketSetInput={props.socketSetInput}
          socketPuzzleToChoices={props.socketPuzzleToChoices}
          socketSetInputFieldBoxClass={props.socketSetInputFieldBoxClass}
          socketSceneTransition={props.socketSceneTransition}
          socketSetPath={props.socketSetPath}
          
          playerId={props.playerId}
          playerArr={props.playerArr}
          ></KeywordDisplay>}
        </div>
      }
      {mode === CHOICES && 
        <>
        <ButtonChoice choice={"approach"} scene={'sixth'} socketSceneTransition={props.socketSceneTransition}
        ></ButtonChoice>
        <ButtonChoice
        choice={'avoid'}
        scene={'eighth'}
        socketSceneTransition={props.socketSceneTransition}
        correctPath={buttonClass}
        ></ButtonChoice>
        </>
      }
    </div>
  )
}