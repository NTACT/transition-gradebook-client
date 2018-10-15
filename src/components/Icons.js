import styled from 'styled-components';

export const  RedCircleX = styled.img.attrs({
  src: require('../assets/red_circle_x.svg')
})``;

export const RedCirclePlus = RedCircleX.extend`transform: rotate(-45deg);`;

export const CircleArrow = styled.img.attrs({
  src: require('../assets/expand_arrow.svg')
})`
  opacity: 0.5;
`;

export const Gear = styled.img.attrs({
  src: require('../assets/gear_icon.svg')
})``;

export const PenSquare = styled.img.attrs({
  src: require('../assets/edit_icon.png')
})``;

export const SpeechBubble = styled.img.attrs({
  src: require('../assets/speech_bubble_icon.png')
})``;

export const WhiteCircleArrow = styled.img.attrs({
  src: require('../assets/select_icon_light.svg')
})``;

export const X = styled.img.attrs({
  src: require('../assets/x_icon.png')
})``;

export const Trash = styled.img.attrs({
  src: require('../assets/trash_icon.png')
})``;

export const OrangeCirclePlus = styled.img.attrs({
  src: require('../assets/orange_plus_icon.svg')
})``;

export const Plus = styled.img.attrs({
  src: require('../assets/plus_icon.png')
})``;

export const WhiteCircleX = Plus.extend`
  transform: rotate(45deg);
`;

export const ArrowSquare = styled.img.attrs({
  src: require('../assets/export_icon.png')
})``;

export const Magnifier = styled.img.attrs({
  src: require('../assets/search_icon_thin.png')
})``;

export const Settings = styled.img.attrs({
  src: require('../assets/settings_icon.png')
})``;

export const OrangeSettings = styled.img.attrs({
  src: require('../assets/orange_settings_icon.png')
})``;

export const WhiteChevron = styled.img.attrs({
  src: require('../assets/white_chevron_icon.png')
})``
