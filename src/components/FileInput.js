import React, { useRef } from 'react';
import FileDrop from 'react-file-drop';
import styled from 'styled-components';
import first from '../utils/first';
import BlockButton from './BlockButton';
import Column from './Column';



const FileInput = ({value, onChange, withDragAndDrop = false, ...rest}) => {

    const fileInputRef = useRef(null);

    function handleClick() {
        if(fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    function handleDrop(files, e) {
        if(!withDragAndDrop) {
            return;
        }
        e.preventDefault();
        const firstFile = first(files);
        if(firstFile) {
            if(firstFile.type === "text/csv") {
                // Note: not in the same format as the one from the <input type="file" />
                onChange({target: { value: {...firstFile, dropped: true}}});
            }
        }
    }

    return (
        <Column {...rest}>
            <input type="file" ref={fileInputRef} value={value || ''} onChange={onChange} accept="text/csv" />
            <FileSelectButton onClick={handleClick}>BROWSE</FileSelectButton>
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

const FileSelectButton = styled(BlockButton)`
    height: 40px;	
    width: 120px;	
    background-color: #D8D8D8;
    margin-top: 7px;
    
    &:hover {
        background-color: #F5633A;
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