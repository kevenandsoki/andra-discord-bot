'use strict';

const dance = async message => {
	await message.channel.send('<a:DANCE:1126731825063141458>');
};

dance.unlisted = true;

export default dance;
