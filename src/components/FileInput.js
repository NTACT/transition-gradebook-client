import React, { useRef } from 'react';
import FileDrop from 'react-file-drop';
import styled, {css, keyframes} from 'styled-components';
import BlockButton from './BlockButton';
import Column from './Column';

const FileInput = ({value, onChange, withDragAndDrop = false, accept, enabled, ...rest}) => {

    const fileInputRef = useRef(null);

    function handleClick() {
        if(!enabled) return;
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    function handleDrop(files, e) {
        if(!withDragAndDrop || !enabled) {
            return;
        }
        e.preventDefault();
        // Need to trigger a similar event that the file input would trigger
        if(typeof onChange === 'function') {
            onChange({target: {
                value: `C:/fakepath/dontusethis.txt`,
                files
            }});
        }
    }

    return (
        <Column {...rest}>
            <input type="file" ref={fileInputRef} value={value || ''} onChange={onChange} accept={accept} />
            <FileSelectButton onClick={handleClick} enabled={enabled}>BROWSE</FileSelectButton>
            {withDragAndDrop && 
                <FileDropZone onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
                    <div>Drag and Drop</div> 
                </FileDropZone>
            }
        </Column>
    );
};

export default styled(FileInput)`
    input {
        visibility: hidden;
        pointer-events: none;
        width: 0;
        height: 0;
    }

`;

const drawAttention = keyframes`
    0% {
        background-color: #D8D8D8;
    }
    50% {
        background-color: #F5633A
    }
    100% {
        background-color: #D8D8D8;
    }
`;

const FileSelectButton = styled(BlockButton)`
    height: 40px;	
    width: 120px;	
    background-color: #D8D8D8;
    margin-top: 7px;

    ${props => props.enabled && css`animation: ${drawAttention} 1s forwards;`}
    
    &:hover {
        ${props => props.enabled ? css`background-color: #F5633A` : css`background-color: #D8D8D8;`}
    }
`;

const FileDropZone = styled(FileDrop)`
    display: flex;
    flex-direction: column;
	height: 136px;	
    width: 259px;	
    background-color: #4A4A4A;
    color: #D8D8D8;	
    justify-content: center;
    align-items: center;
    margin-top: 6px;
`;