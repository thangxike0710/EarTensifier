module.exports = async (msg, pages, emojiList, timeout, queueLength, queueDuration) => {
    if (!msg && !msg.channel) throw new Error('Channel is inaccessible.');
    if (!pages) throw new Error('Pages are not given.');
    if (emojiList.length !== 2) throw new Error('Need two emojis.');
    let page = 0;
    const curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1}/${pages.length} | ${queueLength} songs | ${queueDuration} total duration`));
    for (const emoji of emojiList) await curPage.react(emoji);
    const reactionCollector = curPage.createReactionCollector(
        (reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
        { time: timeout },
    );
    reactionCollector.on('collect', (reaction, user) => {
        if(!user.bot) reaction.users.remove(user.id);
        switch (reaction.emoji.name) {
            case emojiList[0]:
                page = page > 0 ? --page : pages.length - 1;
                break;
            case emojiList[1]:
                page = page + 1 < pages.length ? ++page : 0;
                break;
            default:
                break;
        }
        curPage.edit(pages[page].setFooter(`Page ${page + 1}/${pages.length} | ${queueLength} songs | ${queueDuration} total duration`));
    });
    reactionCollector.on('end', () => curPage.reactions.removeAll());
    return curPage;
};