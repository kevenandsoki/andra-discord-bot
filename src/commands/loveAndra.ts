import send from 'send';

const loveAndra = async message => {
	await send(message.channel, 'Andra loves you too.');
};

loveAndra.unlisted = true;

export default loveAndra;