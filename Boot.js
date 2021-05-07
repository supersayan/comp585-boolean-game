const NUMLEVELS = 8;

export default class Boot extends Phaser.Scene
{
    constructor ()
    {
        super('Boot');
    }

    create ()
    {
        // read best scores from localStorage
        if (typeof(Storage) !== 'undefined') { //check support
            for (let l=0; l<NUMLEVELS; l++) {
                let m = window.localStorage.getItem('level' + (l+1));
                if (m) {
                    this.registry.set('level' + (l+1), m);
                }
            }
        }

        this.scene.start('Preloader');
    }
}
