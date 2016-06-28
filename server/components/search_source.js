import _ from 'underscore';

Listings._ensureIndex({
  "title": "text"
});

//Search function.
SearchSource.defineSource('listings', function(search, options) {
  if(search) {
    let regExp = buildRegExp(search);

    return Listings.find({
        title: regExp,
        sold: false,
        active: true
      },{
        fields: {
          score: { $meta: "textScore" }
        },
        sort: {
          score: { $meta: "textScore" },
          listOfferCount: -1,
          views: -1,
          listingsCount: -1,
          postDate: -1,
          title: 1,
        },
        limit: 20
      }).fetch();
  }
  else {
    return Listings.find().fetch();
  }
});

//Regex for search text.
function buildRegExp(search) {
  let words = search.trim().split(/[ \-\:]+/);
  let exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  let fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}
