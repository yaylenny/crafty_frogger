
( function( window, undefined ){
	//var C=Crafty;

	// constants
	var TILE=32,
		FROGX=224,
		FROGY=416,
		STARTLIVES=4,
		STARTTIME=50, // seconds per run
		TIMEDISPLAYX=160,
		TIMERWIDTH=250,
		POINTSPERJUMP=10,
		POINTSPERGOAL=200,
		POINTSPERBEAT=10;
	
	var gameLevels=[ null,
		{ // level 1
			
		},
		{ //level 2
		}
	];
	
	window.onload=function(){
		Crafty.init( 480, 480 );
		var highScores=[];
		Crafty.c( "Hitchable", {}); // LOGS AND TURTLES
		Crafty.c( "Squisher", {}); // CARS AND TRUCKS
		Crafty.c( "Water", {});
		Crafty.c( "Goal", {});
		Crafty.c( "DeadGround", {});
		Crafty.c( "Scorekeeper", {
			init: function(){
				
			}
		});
		Crafty.c( 'Revolver', { // Hitchables and Squishers
			_xspeed: 2,
			init: function(){
				this.origin( 'center' ).attr({ z: 5 }).bind( 'EnterFrame', function(){
					var speed=this._xspeed;
					var x=this.x + speed,
					w=this._w;
					if ( speed > 0 && x > Crafty.viewport.width ){
						x=-w;
					}
					else if ( speed < 0 && x < -w ){
						x=Crafty.viewport.width + w;
					}
					
					this.attr({ x: x });
				});
			}
		});
		
		
		Crafty.load( [ 'bg.png', 'splash.jpg', 'sprite.png' ], function(){
			Crafty.sprite( 32, 'sprite.png', {
				Frog: [ 0, 0 ],
				SmallFrog: [ 3, 0 ],
				FrogHead: [3,2],
				Car1: [ 0, 1 ],
				Car2: [ 1, 1 ],
				Truck: [ 2, 1],
				Turtle: [ 0, 2 ],
				SmallLog: [ 0, 3 ],
				MedLog: [ 0, 4 ],
				BigLog: [ 0, 5 ]
			});
		});
		
		
		Crafty.scene( "splash", function(){
			Crafty.background('url( splash.jpg ) no-repeat center center');
			Crafty.e("2D, DOM, Text")
				.attr({ w: 480, h: 20, x: 0, y: 15})
				.text('Press Enter to play')
				.css({ 'text-align': 'center', color: '#fff', 'font-size': 20 });
			Crafty.e("Keyboard")
				.bind( 'KeyDown', function( e ){
					if ( e.keyCode === Crafty.keys.ENTER ){
						Crafty.scene( 'frogger' );
					}
				});
		});
		
		Crafty.scene( "frogger", function(){
			Crafty.background( 'url( bg.png ) no-repeat' );
				
				
			var scene=this;
			
			var lives=STARTLIVES, score=0, dying=false, goals=[],   // new game variables
				state="jumping", // dying, goaling
				hitchee=null,
				maxy=FROGY, // keeping track of forward movement
				timeLeft=0+STARTTIME;
			
			var frog=Crafty.e('2D, DOM, Keyboard, Collision, Frog' )
				.origin( 'center' )
				.attr({ x: FROGX, y: FROGY, z: 10, w: TILE, h: TILE })
				.collision( )
				.onHit( 'Squisher', function(){
					if ( state === 'jumping' ) die();
				})
				.onHit( 'Hitchable', function( hitchable ){
					hitchee = hitchable[ 0 ].obj;
				})
				.onHit( 'Water', function( arr ){
					if ( !hitchee && state !== 'dying' ) die();
				})
				.onHit( 'DeadGround', function(){ 
					if ( state === "jumping" ) die(); 
				})
				.onHit( 'Goal', function( arr ){ 
					if ( state == 'jumping' ) { 
						state="goaling";
						updateScore( POINTSPERGOAL + POINTSPERBEAT * timeLeft );
						var goal=arr[ 0 ].obj;
						maxy=FROGY;
						setTimeout( function(){
							Crafty.e('2D, DOM, DeadGround, Collision' )
								.attr({ x: goal._x, y: goal._y, w: goal._w, h: goal._h })
							goals.push( Crafty.e('2D, DOM, FrogHead')
								.attr({ x: goal._x+8, y: goal._y, w: TILE, h: TILE })
							)
							goal.destroy();
							if ( goals.length === 5 ){
								console.log( 'GAME OVER BITCHES' );
							}
							else {
								resetFrog();
							}
						}, 250 );
					}
				})
				.bind( 'KeyDown', function( e ){
					e.preventDefault();
					var x=this._x, y=this._y, r=_r=this.rotation, c=e.keyCode,
					keys={
						up: Crafty.keys.UP_ARROW,
						down: Crafty.keys.DOWN_ARROW,
						right: Crafty.keys.RIGHT_ARROW,
						left: Crafty.keys.LEFT_ARROW
					},
					moveMap={};
						
						moveMap[ keys.up ] = [ 0, -1, 0];
						moveMap[ keys.right ] = [ 1, 0, 90];
						moveMap[ keys.down ] = [0, 1, 180];
						moveMap[ keys.left ] = [ -1, 0, 270 ];
						
					if ( moveMap.hasOwnProperty( e.keyCode ) ){
						if ( hitchee && ( e.keyCode === keys.up || e.keyCode === keys.down ) ){
							hitchee=null;
							//this.unhitch();
						}
						x=x + ( 32 * moveMap[ e.keyCode ][ 0 ] );
						y=y + ( 32 * moveMap[ e.keyCode ][ 1 ] );
						r=moveMap[ e.keyCode][ 2 ];
						
						if ( !hitchee ){
							if ( x < 0 ) x=0;
							if ( x > 448 ) x=448;
							if ( y < 0 ) y=0;
							if ( y>416 )  y=416;
						}
						this.attr({ x: x, y: y, rotation: r });
						this.sprite( this.__coord[ 0 ] === 32 ? 0 : 1, 0, 1, 1 );
						
						if ( e.keyCode === Crafty.keys.UP_ARROW && this._y < maxy ){
							updateScore( POINTSPERJUMP );
							maxy=this._y;
						}
						//~ this.trigger( 'jump', {
							//~ up: c === Crafty.keys.UP_ARROW,
							//~ down: c === Crafty.keys.DOWN_ARROW,
							//~ right: c === Crafty.keys.RIGHT_ARROW,
							//~ left: c === Crafty.keys.LEFT_ARROW
						//~ });
					}
				})
				.bind( 'EnterFrame', function(){
					if ( hitchee ){
						this.attr({ x: this.x + hitchee._xspeed });
						if ( this.x < 0 || this.x >( Crafty.viewport.width - this._w )){
							die();
						}
					}
				});
				
			var ptext=Crafty.e( '2D, DOM, Text' ).attr({ x: 0, w: 80, y: 2 }).text( '1-UP').css({ 'font-size': 20, 'color': '#fff', 'text-align': 'right'});
			var hud={
				'1up': ptext,
				'1upscore': ptext.clone().attr({ x: 90, y:2 }).text( '0' ).css({ 'font-size': 20, 'color': 'red', 'font-weight': 'bold'}),
				'highscore': ptext.clone().attr({ w: 150, x: 200 }).text( 'HI-SCORE').css({ 'font-size': 20, 'text-align': 'center', 'color': '#fff' }),
				'timetext': ptext.clone().attr({ x: 418, y: 448 }).text('TIME').css({ 'font-size': 26, color: 'yellow', 'font-weight': 'bold', 'letter-spacing': '-1px' }),
				timedisplay: Crafty.e( '2D, DOM, Color' ).attr({ x: 160, y: 454, h: 20, w: 250 }).color( 'yellow' )
			};
				
				
			
			// KEEP TRACK OF REMAINING LIVES
			var frogLives=[];
			for ( var i=0, len=lives; i<len; i++ ){
				frogLives.push( Crafty.e( '2D, DOM, SmallFrog' ).attr({ w: 32, h: 32 }) )
			}
			
			updateLivesDisplay();			
			generateRevolvers();
			
			var timer=setInterval(updateTimer, 500 );
			
			// WATER TILES
			( function(){
				var COLS=Crafty.viewport.width / TILE,
				ROWS=5;
				
				for ( var i=0; i<ROWS; i++ ){
					for ( var j=0; j<COLS; j++ ){
						Crafty.e( '2D, DOM, Collision, Water' ).
						attr({ w: TILE, h: TILE, x: TILE * j, y: 64 + TILE * i, z: 0});
					}
				}
			}());
			
			// DEAD GROUND TILES
			( function(){
				var y=56,
					h=8,
					points=[ 
						[ 0, 20 ],
						[ 76, 42 ],
						[ 170, 42 ],
						[ 266, 42 ],
						[ 362, 42 ],
						[ 458, 20 ]
					];
					
				for ( var i=0, len=points.length; i<len; i++ ){
					Crafty.e( '2D, DOM, Color, DeadGround' )
						.attr({ y: y, x: points[ i ][ 0 ], w: points[ i ][ 1 ], h: h });
						//.color('#5CFF00');
				}
			}());
			
			// GOALS
			( function(){
				var y=32,  x=24; // starting point for 96 px lapped goals
				for ( var i=0; i<5; i++ ){
					x=24 + 96 * i;
					Crafty.e( '2D, DOM, Collision, Goal, Color' )
						.attr({ w: 48, h: 32, y: y, x: x })
						//.collision( new Crafty.polygon( [ 8, 8 ], [ 8, 40 ], [ 40, 40 ], [ 40, 8 ]) )
					
				}
				
			}());
			
			function generateRevolvers(){ // make cars, trucks logs turtles 
			// ROW 5
			var car=Crafty.e( '2D, DOM, Collision, Car1, Revolver, Squisher' )
				.attr({ x: 0, y: 384, rotation: 180 }),
			blueCar=Crafty.e( '2D, DOM, Collision, Car2, Revolver, Squisher' )
				.attr({ y: 352, rotation: 0, _xspeed: -3 });
			car.clone().attr({ x: 160 });
				
				
			// ROW 1
			car
				.clone().attr({ _xspeed: -2, rotation: 0, y: 256 })
				.clone().attr({ x: 64 });
			
			// row 4
			blueCar
				.clone().attr({ x: 150 })
				.clone().attr({ x: 330 });
					
			// ROW3
			var truck=Crafty.e( '2D, DOM, Collision, Truck, Revolver, Squisher' )
				.sprite( 2, 1, 2, 1 )
				.attr({ x: 200, y: 320, _xspeed: -2, w: 64 });
				// ROW 2
			blueCar
				.clone().attr({ rotation: 180, _xspeed: 3, y: 288 })
				.clone().attr({ x: 115 })
				.clone().attr({ x: 235 });
			
			// LOG ROW 1
			var log=Crafty.e( '2D, DOM, SmallLog, Collision, Revolver, Hitchable' )
				.attr({ x: 10, y: 64, w: 96, h: 32 })
				.sprite( 0, 3, 3, 1 );
				
			log.clone().attr({ x: 160 })
				.clone().attr({ x: 320 });
				
			// TURTLE ROW2
			var turtle=Crafty.e( '2D, DOM, Collision, Turtle, Revolver, Hitchable' )
				.attr({ x: 10, y: 96, w: 96, h: 32, _xspeed: -2 })
				.sprite( 0, 2, 3, 1 );
				
			turtle.clone().attr({x: 225});
			
			// LOGS ROW3
				var bigLog=Crafty.e( '2D, DOM, BigLog, Collision, Revolver, Hitchable' )
				.attr({ y: 128, w: 192, h: 32, _xspeed: 3 })
				.sprite( 0, 5, 6, 1 );
				
			bigLog.clone().attr({x: 240});
			
			
			// TURTLES ROW4
			turtle
				.clone().attr({	y: 160, _xspeed: -1})
				.clone().attr({ x: 160})
				.clone().attr({ x: 300 });
			
			// LOGS ROW5
			var medLog=Crafty.e( '2D, DOM, MedLog, Collision, Revolver, Hitchable' )
				.attr({ y: 192, x: 200, h: 32, _xspeed: 1, w: 160 })
				.sprite( 0, 4, 5, 1 );
				
			medLog.clone().attr({ x: 355 });
				
			}
			function die(){
				//if ( dying ) return;
				if ( state !== 'dying' ){
					state="dying";
					frog.sprite( 2, 0, 1, 1 );
					lives=lives-1;
					setTimeout( function(){ Crafty.pause() }, 0 );
					setTimeout( function(){
						Crafty.pause();
						if ( lives > 0 ){
							updateLivesDisplay();
							resetFrog();
						}
						else {
							gameOver();
						}
					}, 1000 );
				}
			}
			function updateLivesDisplay(){
				for ( var i=0, len=frogLives.length; i<len; i++ ){
					if ( i < lives - 1 ){ // show the frog
						frogLives[ i ].attr({
							x: 26 * i + 5,
							y: 448
						});
					}
					else {
						frogLives[ i ].destroy();
						frogLives.splice( i, 1 );
					}
				}
			}
			function resetFrog(){
				frog.attr({ x: FROGX, y: FROGY, rotation: 0 })
					.sprite( 0, 0, 1, 1 );
					
				state="jumping";
				hitchee=null;
				timeLeft=STARTTIME;
			}
			function updateScore( n ){
				score=score + ( n ? n : 0);
				hud[ '1upscore' ].text( score );
			}
			function updateTimer(){
				timeLeft=timeLeft - 1;
				
				var newWidth=parseInt( TIMERWIDTH * ( timeLeft / STARTTIME ), 10 );
				hud.timedisplay
					.attr({ w: newWidth, x: TIMEDISPLAYX + ( TIMERWIDTH - newWidth ) })
					.color( timeLeft < 10 ?  'red' : 'yellow' );
					
				if ( timeLeft <= 0 ) die();
			}
			function gameOver(){
				frog.destroy();
				clearTimeout( timer );
				
				Crafty.e( '2D, DOM, Text' )
					.text( 'GAME OVER' )
					.attr({ w: 480, x: 0, y: 200, z: 50})
					.css({ 'font-size': 60, 'text-align': 'center', 'font-weight': 'bold', 'vertical-align': 'middle', color: '#fff', 'text-shadow': '#fff 1px 1px 1px' });
				setTimeout( function(){
					Crafty.scene( 'splash' );
				}, 5000 );
			}
		});
		Crafty.scene( "splash" );
	};
})( window );
