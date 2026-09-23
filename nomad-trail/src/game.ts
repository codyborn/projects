import type Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import TitleScene from './scenes/TitleScene';
import PackScene from './scenes/PackScene';
import RouteScene from './scenes/RouteScene';
import TravelScene from './scenes/TravelScene';
import CityScene from './scenes/CityScene';
import EventScene from './scenes/EventScene';
import EndScene from './scenes/EndScene';
// Added at integration: Coffee, Passport, Share (ART agent) and the six mini-games (MINIGAMES agent).
export const SCENES: (typeof Phaser.Scene)[] = [BootScene, TitleScene, PackScene, RouteScene, TravelScene, CityScene, EventScene, EndScene] as any;
