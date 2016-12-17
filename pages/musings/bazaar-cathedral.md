---
title: The Bazaar Cathedral
template: _layout.html
summary: >
  Adopting the tenants of social coding within an application development team will improve productivity even if you don't expect other individuals to contribute
draft: true
---

### Notes

<hr>

## Cathedral & Bazaar

### Cathedral & Bazaar

* Every Good Work of Software Starts By Scratching A Developer's Personal Itch (23)
* Good Programmers Know What To Write. Great Ones Know What To Rewrite (And Reuse) (24)
* "Plan To Throw One Away; You Will, Anyhow" (Fred Brooks, _The Mythical Man-Month, Chapter 11_) (25)
* If you have the right attitude, interesting problems will find you (26)
* When you lose interest in a program, your last duty is to hand it off to a competent successor (26)
* Treating your users as co-developers is your least-hassle route to rabid code improvement and effective debugging (27)
* Release Early. Release Often. And listen to your customers (29)
* Given a large enough beta-tester and co-developer base, almost every problem will be characterized quickly and the fix obvious to someone (30)
  * "Given enough eyeballs, all bugs are shallow" - "Linus's Law"
* _Delphi effect_ - Averaged opinion of a mass of equally expert (or equally ignorant) observers is quite a bit more reliable a predictor than the opinion of a single randomly chosen observer (31)
  * Delphi effect can tame development complexity even at the complexity level of an OS kernel
* On Brooks Law  (34)

> The fundamental problem that traditional software-development organization addresses is Brook's Law: “Adding more programmers to a late project makes it later.” More generally, Brooks's Law predicts that the complexity and communication costs of a project rise with the square of the number of developers, while work done only rises linearly.
> 
> Brooks's Law is founded on experience that bugs tend strongly to cluster at the interfaces between code written by different people, and that communications/coordination overhead on a project tends to rise with the number of interfaces between human beings. Thus, problems scale with the number of communications paths between developers, which scales as the square of the number of developers (more precisely, according to the formula N*(N - 1)/2 where N is the number of developers).
> 
> Brooks's Law is founded on experience that bugs tend strongly to cluster at the interfaces between code written by different people, and that communications/coordination overhead on a project tends to rise with the number of interfaces between human beings. Thus, problems scale with the number of communications paths between developers, which scales as the square of the number of developers (more precisely, according to the formula N*(N - 1)/2 where N is the number of developers).

* Smart data structures and dumb code works a lot better then the other way around (38)
* If you treat your beta-testers as if they're your most valuable resource, they will respond by becoming your most valuable resource
* The next best thing to having good ideas is recognizing good ideas from your users. Sometimes the latter is better (40)
* Often, the most striking innovative solutions come from realizing that your concept of the problem was wrong (40)
* "Perfection (in design) is achieved not when there is nothing more to add, but rather when there is nothing more to take away" - Antoine de Saint-Exupéry (41)
* Any tool should be useful in the expected way, but a truly great tool lends itself to uses you never expected (44)
* A security system is only as secure as its secret. Beware of pseudo-secrets (46)
* Necessary Preconditions for Bazaar Style (47) 

> It's fairly clear that one cannot code from the ground up in bazaar style. One can test, debug, and improve in bazaar style, but it would be very hard to _originate_ a project in bazaar mode.
> 
> …When you start community building, what you need to be able to present is a _plausible promise_. Your program doesn't have to work particularly well. It can be crude, buggy, incomplete, and poorly documented. What it must not fail to do is (a) run, and (b) convince potential co-developers that it can be evolved into something really neat in the foreseeable future
> 
> …I think it is not critical that the coordinator be able to originate designs of exceptional brilliance, but it is absolutely critical that the coordinator be able to _recognize good design ideas from others_.

> Early audiences of this essay complimented me by suggesting that I am prone to undervalue design originality in bazaar projects because I have a lot of it myself, and therefore take it for granted. There may be some truth to this; design (as opposed to coding or debugging) is certainly my strongest skill.
> 
> But the problem with being clever and original in software design is that it gets to be a habit — you start reflexively making things cute and complicated when you should be keeping them robust and simple. I have had projects crash on me because I made this mistake[.]
 
* Psychology of Computer Programming (50) 

> Gerald Weinberg's classic _The Psychology of Computer Programming_ supplied what, in hindsight, we can see as a vital correction to Brooks. In his discussion of egoless programming, Weinberg observed that in shops where developers are not territorial about their code, and encouraged other people to look for bugs and potential imporvements in it, improvement happens dramatically faster than elsewhere…
> 
> The bazaar method, by harnessing the full power of the egoless programming effect, strongly mitigates the effect of Brooks's Law. The principle behind Brooks's Law is not repealed, but given a large developer population and cheap communications its effects can be swamped by competing nonlinearities that are not otherwise visible. This resembles the relationship between Newtonian and Einsteinian physics – the older system is still valid at low energies, but if you push mass and velocity high enough you get surprises like nuclear explosions or Linux

* Memoirs of a Revolutionist (52)

> While cheap Internet was a necessary condition for the Linux model to evolve, I think it was not by itself a sufficient condition. Another vital factor was the development of a leadership style and set of cooperative customs that could allow developers to attract co-developers and get maximum leverage out of the medium.
> 
> But what is this leadership style and what are these customs? They cannot be based on power relationships—and even if they could be, leadership by coercion would not produce the results we see. Weinberg quotes the autobiography of the 19th-century Russian anarchist Pyotr Alexeyvich Kropotkin's _Memoirs of a Revolutionist_ to good effect on this subject:
> 
> > Having been brought up in a serf-owner's family, I entered active life, like all young men of my time, with a great deal of confidence in the necessity of commanding, ordering, scolding, punishing and the like. But when, at an early stage, I had to manage serious enterprises and to deal with [free] men, and when each mistake would lead at once to heavy consequences, I began to appreciate the difference between acting on the principle of command and discipline and acting on the principle of common understanding. The former works admirably in a military parade, but it is worth nothing where real life is concerned, and the aim can be achieved only through the severe effort of many converging wills.
> 
> The “severe effort of many converging wills” is precisely what a project like Linux requires—and the “principle of command” is effectively impossible to apply among volunteers in the anarchist's paradise we call the Internet. To operate and compete effectively, hackers who want to lead collaborative projects have to learn how to recruit and energize effective communities of interest in the mode vaguely suggested by Kropotkin's “principle of understanding”. They must learn to use Linus's Law.

* Managing the Maganot Line (57)

> So what is all that management overhead buying?
> 
> In order to understand that, we need to understand what software development managers believe they do. A woman I know who seems to be very good at this job says software project management has five functions:
> * To define goals and keep everybody pointed in the same direction
> * To monitor and make sure crucial details don't get skipped
> * To motivate people to do boring but necessary drudgework
> * To organize the deployment of people for best productivityTo marshal resources needed to sustain the project
> 
> Apparently worthy goals, all of these; but under the open-source model, and in its surrounding social context, they can begin to seem strangely irrelevant. We'll take them in reverse order.
> 
> My friend reports that a lot of _resource marshalling_ is basically defensive; once you have your people and machines and office space, you have to defend them from peer managers competing for the same resources, and from higher-ups trying to allocate the most efficient use of a limited pool.

> Can we save _defining goals_ as a justification for the overhead of conventional software project management? Perhaps; but to do so, we'll need good reason to believe that management committees and corporate roadmaps are more successful at defining worthy and widely shared goals than the project leaders and tribal elders who fill the analogous role in the open-source world.
> 
> That is on the face of it a pretty hard case to make. And it's not so much the open-source side of the balance (the longevity of Emacs, or Linus Torvalds's ability to mobilize hordes of developers with talk of “world domination”) that makes it tough. Rather, it's the demonstrated awfulness of conventional mechanisms for defining the goals of software projects.
> 
> One of the best-known folk theorems of software engineering is that 60% to 75% of conventional software projects either are never completed or are rejected by their intended users. If that range is anywhere near true (and I've never met a manager of any experience who disputes it) then more projects than not are being aimed at goals that are either (a) not realistically attainable, or (b) just plain wrong.
 
* Process (60)

> Our reply, then, to the traditional software development manager, is simple—if the open-source community has really underestimated the value of conventional management, _why do so many of you display contempt for your own process_?
> 
> Once again the example of the open-source community sharpens this question considerably—because we have _fun_ doing what we do. Our creative play has been racking up technical, market-share, and mind-share successes at an astounding rate. We're proving not only that we can do better software, but that _joy is an asset_.
> 
>  I want to suggest what may be a wider lesson about software, (and probably about every kind of creative or professional work). Human beings generally take pleasure in a task when it falls in a sort of optimal-challenge zone; not so easy as to be boring, not too hard to achieve. A happy programmer is one who is neither underutilized nor weighed down with ill-formulated goals and stressful process friction. _Enjoyment predicts efficiency_.
>  
>  Relating to your own work process with fear and loathing (even in the displaced, ironic way suggested by hanging up Dilbert cartoons) should therefore be regarded in itself as a sign that the process has failed. Joy, humor, and playfulness are indeed assets; it was not mainly for the alliteration that I wrote of "happy hordes" above, and it is no mere joke that the Linux mascot is a cuddly, neotenous penguin.
>  
>  It may well turn out that one of the most important effects of open source's success will be to teach us that play is the most economically efficient mode of creative work.

### Homesteading the Noosphere (94)

* If it doesn't work as well as I have been led to expect it will, it's no good – no matter how clever and original it is.
* Utilization is the sincerest form of flattery – and category killers are better than also-rans.
* Continued devotion to hard, boring work (like debugging, or writing documentation) is more praiseworthy than cherrypicking the fun and easy hacks
* Nontrivial extensions of function are better than low-level patches and debugging
* Paradox (109)

> Indeed, it seems the prescription for highest software productivity is almost a Zen paradox; if you want the most efficient production, you must give up trying to _make_ programmers produce. Handle their subsistence, give them their heads, and forget about deadlines. To a conventional manager, this sounds crazy indulgent and doomed – but it is _exactly_ the recipe with which the open-source culture is now clobbering its competition.

### The Magic Cauldron

https://www.safaribooksonline.com/library/view/the-cathedral/0596001088/ch04s03.html

> We need to begin by noticing that computer programs like all other kinds of tools or capital goods, have two distinct kinds of economic value. They have use value and sale value.
> 
> The use value of a program is its economic value as a tool. a productivity multiplier. The sale value of a program is its value as a salable commodity. (In professional economist-speak, sale value is value as a final good, and use value is value as an intermediate good.)
> 
> When most people try to reason about software-production economics, they tend to assume a “factory model” which is founded on the following fundamental premises:
> 
> * Most developer time is paid for by sale value.
> * The sale value of software is proportional to its development cost (i.e., the cost of the resources required to functionally replicate it) and to its use value.
> 
> In other words, people have a strong tendency to assume that software has the value characteristics of a typical manufactured good. But both of these assumptions are demonstrably false.


> Most such in-house code is integrated with its environment in ways that make reusing or copying it very difficult. (This is true whether the environment is a business office's set of procedures or the fuel-injection system of a combine harvester.) Thus, as the environment changes, work is continually needed to keep the software in step.
> 
> This is called “maintenance”, and any software engineer or systems analyst will tell you that it makes up the vast majority (more than 75%) of what programmers get paid to do. Accordingly, most programmer-hours are spent (and most programmer salaries are paid for) writing or maintaining in-house code that has no sale value at all—a fact the reader may readily check by examining the listings of programming jobs in any newspaper with a “Help Wanted” section.

> Second, the theory that the sale value of software is coupled to its development or replacement costs is even more easily demolished by examining the actual behavior of consumers. There are many goods for which a proportion of this kind actually holds (before depreciation)—food, cars, machine tools. There are even many intangible goods for which sale value couples strongly to development and replacement cost—rights to reproduce music or maps or databases, for example. Such goods may retain or even increase their sale value after their original vendor is gone.
> 
> By contrast, when a software product's vendor goes out of business (or if the product is merely discontinued), the maximum price consumers will pay for it rapidly falls to near zero regardless of its theoretical use value or the development cost of a functional equivalent. (To check this assertion, examine the remainder bins at any software store near you.)
> 
> The behavior of retailers when a vendor folds is very revealing. It tells us that they know something the vendors don't. What they know is this: the price a consumer will pay is effectively capped by the _expected future value of vendor service_ (where “service” is here construed broadly to include enhancements, upgrades, and follow-on projects)
> 
> In other words, software is largely a service industry operating under the persistent but unfounded delusion that it is a manufacturing industry.

> It is also worth noting that the manufacturing delusion encourages price structures that are pathologically out of line with the actual breakdown of development costs. If (as is generally accepted) over 75% of a typical software project's life-cycle costs will be in maintenance and debugging and extensions, then the common price policy of charging a high fixed purchase price and relatively low or zero support fees is bound to lead to results that serve all parties poorly.
> 
> Consumers lose because, even though software is a service industry, the incentives in the factory model all work against a vendor's offering competent service. If the vendor's money comes from selling bits, most effort will go into making bits and shoving them out the door; the help desk, not a profit center, will become a dumping ground for the least effective employees and get only enough resources to avoid actively alienating a critical number of customers.
> 
> It gets worse. Actual use means service calls, which cut into the profit margin unless you're charging for service. In the open-source world, you seek the largest possible user base, so as to get maximum feedback and the most vigorous possible secondary markets; in the closed-source you seek as many buyers but as few actual users as possible. Therefore the logic of the factory model most strongly rewards vendors who produce shelfware—software that is sufficiently well marketed to make sales but actually useless in practice.

* Widespread Use (125)

> "…the 'Tragedy of the Commons' model fails to capture what is actually going on [with open source software]"
> Part of the answer certainly lies in the fact that using software does not decrease its value. Indeed, widespread use of open-source software tends to _increase_ its value, as users fold in their own fixes and features (code patches). In this inverse commons, the grass grows taller when it's grazed upon.

* Push towards Open Source (146)

> In summary the following discriminators push towards open source:
> * Reliability/stability/scalability are critical
> * Correctness of design and implementation cannot readily be verified by means other than independent peer review
> * The software is critical to the user's control of his/her business
> * The software establishes or enables a common computing and communications infrastructure
> * Key methods (or functional equivalents of them) are part of common engineering knowledge

* "Wake me up when it's over" management produces higher quality work that is delivered faster

### Footnotes

* Transparency and peer review (220)

> That transparency and peer review are valuable for taming the complexity of OS development turns out, after all, not to be a new concept. In 1965, very early in the history of time-sharing operating systems, Corbató and Vyssotsky, co-designers of the Multics operatings system wrote:
> 
> >It is expected that the Multics system will be published when it is operating substantally… Such publication is desirable for two reasons: First, the system should withstand public scrutiny and criticism volunteered by interested readers; second, in an age of increasing complexity, it is an obligation to present and future system designers to make the inner operating system as lucid as possible so as to reveal the basic system issues.

* Linux's experimental and stable versions (221)

> The split between Linux's experimental and stable versions has another function related to, but distinct from, hedging risk. The split attacks another problem: the deadliness of deadlines. When programmers are held both to an immutable feature list and a fixed drop-dead date, quality goes out the window and there is likely a colossal mess in the making. I am indebted to Marco Iansiti and Alan MacCormack of the Harvard Business School for showing me evidence that relaxing either one of these constraints can make scheduling workable.
> 
> One way to do this is to fix the deadline but leave the feature list flexible, allowing features to drop off if not completed by deadline. This is essentially the strategy of the "stable" kernel branch; Alan Cox (the stable-kernel maintainer) puts out releases at fairly regular intervals, but makes no guarentees about when particular bugs will be fixed or what features will be back-ported from the experimental branch.
> 
> The other way to do this is to set a desired feature list and deliver only when it is done. This is essentially the strategy of the “experimental” kernel branch. De Marco and Lister cited research showing that this scheduling policy ("wake me up when it's done") produces not only the highest quality but, on average, shorter delivery times than either "realistic" or "aggressive" scheduling.
> 
> I have come to suspect (as of early 2000) that in earlier versions of this essay I severely underestimated the importance of the “wake me up when it's done” anti-deadline policy to the open-source community's productivity and quality. General experience with the rushed GNOME 1.0 release in 1999 suggests that pressure for a premature release can neutralize many of the quality benefits open source normally confers.
> 
> It may well turn out to be that the process transparency of open source is one of three co-equal drivers of its quality, along with “wake me up when it's done” scheduling and developer self-selection.

* Halloween Documents (222)

> But there is a more fundamental error in the implicit assumption that the _cathedral model_ (or the bazaar model, or any other kind of management structure) can somehow make innovation happen reliably. This is nonsense. Gangs don't have breakthrough insights—even volunteer groups of bazaar anarchists are usually incapable of genuine originality, let alone corporate committees of people with a survival stake in some status quo ante. _Insight comes from individuals_. The most their surrounding social machinery can ever hope to do is to be _responsive_ to breakthrough insights—to nourish and reward and rigorously test them instead of squashing them.
> 
> Some will characterize this as a romantic view, a reversion to outmoded lone-inventor stereotypes. Not so; I am not asserting that groups are incapable of _developing_ breakthrough insights once they have been hatched; indeed, we learn from the peer-review process that such development groups are essential to producing a high-quality result. Rather I am pointing out that every such group development starts from—is necessarily sparked by—one good idea in one person's head. Cathedrals and bazaars and other social structures can catch that lightning and refine it, but they cannot make it on demand.
> 
> Therefore the root problem of innovation (in software, oranywhere else) is indeed how not to squash it—but, even morefundamentally, it is _how to grow lots of people who can haveinsights in the first place_.


* Conway's Law (224)

> Of course, Kropotkin's critique and Linus's Law raise some wider issues about the cybernetics of social organizations. Another folk theorem of software engineering suggests one of them; Conway's Law—commonly stated as “If you have four groups working on a compiler, you'll get a 4-pass compiler”. The original statement was more general: “Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations.” We might put it more succinctly as “The means determine the ends”, or even “Process becomes product”.
> 
> It is accordingly worth noting that in the open-source community organizational form and function match on many levels. The network is everything and everywhere: not just the Internet, but the people doing the work form a distributed, loosely coupled, peer-to-peer network that provides multiple redundancy and degrades very gracefully. In both networks, each node is important only to the extent that other nodes want to cooperate with it.
> 
> The peer-to-peer part is essential to the community's astonishing productivity. The point Kropotkin was trying to make about power relationships is developed further by the “SNAFU Principle”: “True communication is possible only between equals, because inferiors are more consistently rewarded for telling their superiors pleasant lies than for telling the truth.” Creative teamwork utterly depends on true communication and is thus very seriously hindered by the presence of power relationships. The open-source community, effectively free of such power relationships, is teaching us by contrast how dreadfully much they cost in bugs, in lowered productivity, and in lost opportunities.
> 
> Further, the SNAFU principle predicts in authoritarian organizations a progressive disconnect between decision-makers and reality, as more and more of the input to those who decide tends to become pleasant lies. The way this plays out in conventional software development is easy to see; there are strong incentives for the inferiors to hide, ignore, and minimize problems. When this process becomes product, software is a disaster.

* Henry Spencer (227)

> Henry Spencer (henry@spsystems.net) suggests that, in general, the stability of a political system is inversely proportional to the height of the entry barriers to its political process. His analysis is worth quoting here:
> 
> > One major strength of a relatively open democracy is that most potential revolutionaries find it easier to make progress toward their objectives by working via the system rather by attacking it. This strength is easily undermined if established parties act together to “raise the bar”, making it more difficult for small dissatisfied groups to see some progress made toward their goals.
> > 
> An open process with low entry barriers encourages participation rather than secession, because one can get results without the high overheads of secession. The results may not be as impressive as what could be achieved by seceding, but they come at a lower price, and most people will consider that an acceptable tradeoff. (When the Spanish government revoked Franco's anti-Basque laws and offered the Basque provinces their own schools and limited local autonomy, most of the Basque Separatist movement evaporated almost overnight. Only the hard-core Marxists insisted that it wasn't good enough.)


## The Mythical Man-Month

* Programming Systems Product (5)
  * Program (One Off, top-left corner)
    * 1x hard to create
  * Programing System (Interfaces, System Integration; top-right corner)
    * 3x harder to create
    * Collection of interacting programs, coordinated in function and disciplined in format, so the assemblage constitutes an entire facility for large tasks
    * Every input and output conforms in syntax and semantics with precisely defined interfaces
    * Only uses a prescribed budget of resources
  * Programming Product (Generalization, testing, documentation, maintenance; bottom-left corner)
    * 3x harder to create
    * Run, tested, repaired, extended by anyone
    * Usable in many operating envs for many sets of data
    * Must be written in a generalized fashion
  * Programming Systems Product
    * 9x harder to create
    * Truly useful object, intended product of most system programming efforts
    * Is both of the above
* Calendar Time (14)

> More software projects have gone awry for lack of calendar time than for all other causes combined.
>
> [O]ur techniques of estimating are poorly developed. More seriously, they reflect an unvoiced assumption which is quite untrue, i.e., that all will go well.
> 
> Second, our estimating techniques fallaciously confuse effort with progress, hiding the assumption that men and months are interchangeable.
> 
> Third, because we are uncertain of our estimates, software managers often lack the courteous stubbornness of Antoine's Chef (Good cooking takes time. If you are made to wait, it is to serve you better, and to please you. Menu of restaurant Antoine, New Orleans)
> 
> Fourth, schedule progress is poorly monitored. Techniques proven and routine in other engineering disciplines are considered radical innovations in software engineering
> 
> Fifth, when schedule slippage is recognized, the natural (and traditional) response is to add manpower. Like dousing a fire with gasoline, this makes matters worse, much worse. More fire requires more gasoline, and thus begins a regenerative cycle which ends in disaster.

* All Will Go Well (15)
  * Dorthy Sayers, _The Mind of the Maker_
  * Creative activity in 3 stages:
    * Idea
      * Ideal construct first, outside space and time
      * Exists complete, but in the mind of the author only
    * Implementation
      * Realized in space and time by creating or building
    * Interaction
      * Not complete until someone uses the, thereby interacting with the mind of the maker

> Computer programming, [unlike physical media], creates with an exceedingly tractable medium. The programmer builds from pure thought-stuff: concepts and very flexible representations thereof. Because the medium is tractable, we expect few difficulties in implementation; hence our pervasive optimism. Because our ideas are faulty, we have bugs; hence our optimism is unjustified

* Man Month (16 COME BACK TO THIS) 
  * Cost varies by number of workers and number of months, but progress does not

> _[T]he man-month as a unit for measuring the size of a job is a dangerous and deceptive myth_. It implies that men and months are interchangeable.
> 
> **Men and months are interchangeable commodities only when a task can be partitioned amongst many works _with no communication among them_**. (bold mine)
> 
> When a task cannot be partitioned because of sequential constraints, the application of more effort has no effect on the schedule. The bearing of a child takes nine months, no matter how many women are assigned. _Many software tasks have this characteristic because of the sequential nature of debugging_ (emphasis mine)
> 
> In tasks that can be partitioned but which require communication among the subtasks, the effort of communication must be added to the amount of work to be done. Therefore the best that can be done is somewhat poorer than an even trade of men for months

* Omelettes (21)

> The cook has another choice; he can turn up the heat. The result is often an omelette nothing can save—burned in one part, raw in another.
> 
> The cook has another choice; he can turn up the heat. The result is often an omelette nothing can save—burned in one part, raw in another.

* Brooks' Law
  * _Adding manpower to a late software project makes it later._

### The Surgical Team

(31)

> This then is the problem with the small, sharp team concept: _it is too slow for really big systems_.
> 
> The dilemma is a cruel one. For efficiency and conceptual integrity, one prefers a few good minds doing design and construction. Yet for large systems one wants a way to bring considerable manpower to bear, so that the product can make a timely appearance. How can these two needs be reconciled?

### Aristocracy, Democracy, and System Design

* Conceptual Integrity (42)

> …[C]onceptual integrity is _the_ most important consideration in a system design. It is better to have a system omit certain anomalous features and improvements, but to reflect one set of design ideas, than to have one that contains many good but independent and uncoordinated ideas.

* Achieving Conceptual Integrity (43)

> The purpose of a programming system is to make a computer easy to use. To do this, it furnishes languages and various facilities that are in fact programs invoked by controlled language features. But these facilities are bought at a price.
> 
> Ease of use is enhanced only if the time gained in functional specification exceeds the time lost in learning, remembering, and searching manuals

* Architect (45)

> By the _architecture_ of a system, I mean the complete and detailed specification of the user interface. For a computer this is the programming manual. For a compiler it is the language manual. For a control program it is the manuals for the language or languages used to invoke its functions. For the entire system it is the union of the manuals the user must consult to do his entire job.
> 
> The architect of a system, like the architect of a building, is the user's agent. It is his job to bring professional and technical knowledge to bear in the unalloyed interest of the user, as opposed to the interests of the salesman, the fabricator, etc.
> 
> Architecture must be carefully distinguished from implementation. As Blaauw has said, "Where architecture tells _what_ happens, implementation tells _how_ it is made to happen." He gives as a simple example a clock, whose architecture consists of the face, the hands, and the winding knob. When a child has learned this architecture, he can tell time as easily from a wristwatch as from a church tower. The implementation, however, and its realization, describe what goes on inside the case – powering by any of many mechanisms and accuracy control by any of many. 

### Why Did The Tower of Babel Fall?

* Organization in the Large Programming Project (78)

> If there are _n_ worker son a project, there are (_n_^2-_n_)/2 interfaces across which there may be communication, and there are potentially almost 2^_n_ teams within which coordination must occur. The purpose of organization is to reduce the amount of communication and coordination necessary; hence organization is a radical attack on the communication problems treated above.
> 
> The means by which communication is obviated are _division of labor_ and _specialization of function_. The tree-like structure of organizations reflects the diminishing need for detailed communication when division and specialization of labor are applied.
> 
> In fact, a tree organization really arises as a structure of authority and responsibility. The principle that no man can serve two masters dictates that the authority structure be tree-like. But the communication structure is not so restricted, and the tree is a barely passable approximation of the communication structure, which is a network. The inadequacies of the tree approximation give rise to staff groups, task forces, committees, and even the matrix-type organization used in many engineering laboratories.

### The Documentary Hypothesis

* Documents for a Software Project (110)
  * What: Objectives (needs to be met and goals, desiredata, constraints, priorities)
  * What: Product specifications (winds up as manual and internal docs. Speed & space specs are critical)
  * When: Schedule
  * How Much: budget
  * Where: Space allocation
  * Who: Org Chart (Conway's Law)

> [A]s Conway's Law predicts: "Organizations which design systems are constrained to produce systems which are copies of the communication structures of these organizations." Conway goes on to point out that the organization chart will initially reflect the first system design, which is almost surely not the right one. If the system design is to be free to change, the organization must be prepared to change.

### Plan to Throw One Away

* Pilot Plants and Scaling Up (116)
  * In order to go from a lab setting to scale there needs to be an intermediate step, a _pilot plant_

> Project after project designs a set of algorithms and then plunges into construction of customer-deliverable software on a schedule that demands delivery of the first thing built.
> 
> In most projects, the first system built is barely usable. It may be too slow, too big, awkward to use, or all three. There is no alternative but to start again, smarting but smarter, and build a redesigned version in which these problems are solved. This discard and redesign may be done in one lump, or it may be done piece-by-piece. But all large-system concept or new technology is used, one has to build a system to throw away, for even the best planning is not so omniscient as to get it right the first time.
> 
> The management question, therefore, is not _whether_ to build a pilot system and throw it away. You _will_ do that. The only question is whether to plan in advance to build a throwaway, or to promise to deliver the throwaway to the customer. Seen this way, the answer is much clearer. Delivering that throwaway to customers buys time, but it does so only at the cost of agony for the user, distraction for the builders while they do the redesign, and a bad reputation for the product that the best redesign will find hard to live down.
> 
> Hence _plan to throw one away; you will anyhow_.

* The Only Constancy is Change Itself (117)

> Once one recognizes that a pilot system must be built and discarded, and that a redesign with changed ideas is inevitable, it becomes useful to face the whole phenomenon of change The first step is to accept the fact of change as a way of life, rather than an untoward and annoying exception. Cosgrove has perceptively pointed out that the programmer delivers satisfaction of a user need rather than any tangible product. And both the actual need and the user's perception of that need will change as programs are built, tested, and used

* Plan the Organization for Change (118)

> [Cosgrove] observes that the reluctance to document designs is not due merely to laziness or time pressure. Instead it comes from the designer's reluctance to commit himself to the defense of decisions which he knows to be tentative. "By documenting a design, the designer exposes himself to the criticisms of everyone, and he must be able to defend everything he writes. If the organizational structure is threatening in any way, nothing is going to be documented until it is completely defensible."
> 
> Structuring an organization for change is much harder than designing a system for change. Each man must be assigned to jobs that broaden him, so that the whole force is technically flexible. On a large project the manager needs to keep two or three top programmers as a technical cavalry that can gallop to the rescue wherever the battle is thickest.

### Sharp Tools

* Machine Shops (128)

> Many programming projects are still operated like machine shops so far as tools are concerned. Each master mechanic has his own personal set, collected over a lifetime and carefully locked and guarded – the visible evidences of personal skills. Just so, the programmer keeps little editors, sorts, binary dumps, disk space utilities, etc., stashed away in his file.
> 
> Such an approach, however, is foolish for a programming project. First, the essential problem is communication, and individualized tools hamper rather than aid communication. Second, the technology changes when one changes machines or working language, so tool lifetime is short. Finally, it is obviously much more efficient to have common development and maintenance of the general-purpose programming tools.
> 
> General-purpose tools are not enough, however. Both specialized needs and personal preferences dictate the need for specialized tools as well; so in discussing programming teams I have postulated one toolmaker per team. This man masters all of the common tools and is able to instruction his client-boss in their use. He also builds the specialized tools his boss needs.

* Program Libraries and Accounting (132)
  * Each programmer has a _playpen_ area without restriction to do work their own work in, unrestricted
  * When a component is ready for integration, passed a copy over to the manager of a _system integration sublibrary_. Once there, cannot be changed by original programmer
  * When a system version is ready for larger use, promoted to _current version sublibrary_. Only touched to fix crippling bugs
  * Developed independently at IBM, Bell Labs, ICL, Cambridge University. Piece of management technology.

### The Whole and the Parts

* Top-Down Design (143)
  * Division of system building into architecture, implementation, and realization
  * Sequence of _refinement steps_
  * From process, _modules_ of solutions or data identified  that can be refined independently
    * Degree of modularity determines adaptability and changeability of program

### THe Other Face

* What Documentation Is Required? (165)
  * Users need prose description of program

> * _Prose_. What is the main function, the reason for the program
> * _Environment_. On what machines, hardware configurations, operating system configurations will it run?
> * _Domain and range_. What domain of input is valid? What range of output can legitimately appear?
> * _Functions realized and algorithms used_. Precisely what does it do?
> * _Input-output formats_, precise and complete
> * _Operating instructions_, including normal and abnormal ending behavior, as seen at the console and on the outputs
> * _Options_. What choices does the user have about functions? Exactly how are those choices specified?
> * _Running time_. How long does it take to do a problem of specified size on a specified configuration?
> * _Accuracy and checking_. How precise are the answers expected to be? What means of checking accuracy are incorporated

### No Silver Bullet

* Complexity (183)

> The complexity of software is an essential property, not an accidental one. Hence descriptions of a software entity that abstract away its complexity often abstract away its essence.

> Many of the classical problems of developing software products derive from the essential complexity and tis nonlinear increase with size. From the complexity comes the difficulty of communication among team members, which leads to product flaws cost overruns, schedule delays. From the complexity comes the difficulty of enumerating, much less understanding, all the possible states of the program, and from that comes the unreliability. From the complexity of the functions comes the difficulty of invoking those functions, which makes programs hard to use. From complexity of structure comes the difficulty of extending programs to new functions without creating side effects. From complexity of structure comes the unvisualized states that constitute security trapdoors.

* Changeability (184)
  * Change happens for two reasons: tried in edge cases and beyond original domain, 

* Artificial Intelligence (190)
* Requirements refinement and rapid prototyping (199)
  * "[T]he most important function that software builders do for their clients is the iterative extraction and refinement of the product requirements. For the truth is, the clients do not know what they want. They usually do not know what questiosn muc be answered, and they almost never have thought of the problem in the detail that must be specified"
