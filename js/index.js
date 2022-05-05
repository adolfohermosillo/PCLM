const fsLibrary  = require('fs')

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    start: function() {
    exp.startT = Date.now();
    }
  });

  slides.instructions = slide({
    name : "instructions",
    button : function() {
      exp.subj_data = {
        language :  $("#language").val() }
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });




  slides.one_slider = slide({
    name : "one_slider",
    present: exp.stims, //every element in exp.stims is passed to present_handle one by one as 'stim'

    present_handle : function(stim) {
      $(".err").hide();

      this.stim = stim; // store this information in the slide so you can record it later
      $(".prompt").html(stim.sentence);
      document.getElementById("translation").value = "";
      document.getElementById("morphology").value = "";
      document.getElementById("gloss").value = "";


      //var objimagehtml = '<img src="img/stimuli/'+stim.item+ '_'+ '0.png" style="height:250px; width:250px; ">';
      //$(".food1").html(objimagehtml);

      //var objimagehtml = '<img src="img/stimuli/'+stim.item+'_'+stim.state+'.png" style="height:250px; width:250px; ">';
      //$(".food2").html(objimagehtml);



      $('input[name="natural"]').prop("checked", false);

      // this.init_sliders();
      // exp.sliderPost = null; //erase current slider value
    },

    button : function() {
      exp.response = $("#translation").val();
      if (exp.response == "") {
        $(".err").show();
      } else {
        this.log_responses();
      /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
      _stream.apply(this);

      }
    },

    // init_sliders : function() {
    //   utils.make_slider("#single_slider", function(event, ui) {
    //     exp.sliderPost = ui.value;
    //   });
    // },

    log_responses : function() {
    exp.data_trials.push({
        "slide_number" : exp.phase,
        "item" : this.stim.sentence,
        "fable_id" : this.stim.fable_id,
        "sent_id" : this.stim.sent_id,
        "translation" : $("#translation").val(),
        "morphology" : $("#morphology").val(),
        "gloss" : $("#gloss").val(),
        //"condition" : this.stim.condition,
        "response" : exp.response.toUpperCase()
    });

    }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      exp.subj_data = {
        language : $("#language").val(),
        asses : $('input[name="assess"]:checked').val(),
        problems: $("#problems").val(),
        improve: $("#improve").val(),
        name : $("#name").val(),
      };
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      exp.data= {
          "trials" : exp.data_trials,
          "system" : exp.system,
          "subject_information" : exp.subj_data,
          "time_in_minutes" : (Date.now() - exp.startT)/60000
      };

      setTimeout(function() {proliferate.submit(exp.data);}, 1000);


    }
  });


  return slides;
}

/// init ///
function init() {
  exp.trials = [];
  exp.catch_trials = [];

    var items = [
    {sentence : "EL ÁGUILA, LA LIEBRE Y EL ESCARABAJO",fable_id: 1, sent_id: 1},
    {sentence: "Estaba una liebre siendo perseguida por un águila, y viéndose perdida pidió ayuda a un escarabajo, suplicándole que le ayudara.", fable_id: 1, sent_id: 2},
    {sentence: "Le pidió el escarabajo al águila que perdonara a su amiga.",fable_id: 1, sent_id: 3}]
    {sentence: "Pero el águila, despreciando la insignificancia del escarabajo, devoró a la liebre en su presencia.",fable_id: 1, sent_id: 4},
    {sentence: "Desde entonces, buscando vengarse, el escarabajo observaba los lugares donde el águila ponía sus huevos, y haciéndolos rodar, los tiraba a tierra. ",fable_id: 1, sent_id:5 },
    {sentence: "Viéndose el águila echada del lugar a donde quiera que fuera, recurrió a Zeus pidiéndole un lugar seguro para depositar sus huevos.",fable_id: 1, sent_id:6 },
    {sentence: "Le ofreció Zeus colocarlos en su regazo, pero el escarabajo, viendo la táctica escapatoria, hizo una bolita de estiércol, voló y la dejó caer sobre el regazo de Zeus.",fable_id: 1, sent_id:7 },
    {sentence: "Se levantó entonces Zeus para sacudirse aquella suciedad, y tiró por tierra los huevos sin darse cuenta.",fable_id: 1, sent_id:8  },
    {sentence: "Por eso desde entonces, las águilas no ponen huevos en la época en que salen a volar los escarabajos.",fable_id: 1, sent_id: 9},
    {sentence: "Nunca desprecies lo que parece insignificante, pues no hay ser tan débil que no pueda alcanzarte.",fable_id: 1, sent_id:10 }]




  exp.stims = items; // (_.sample((items), 5));

  exp.system = {
      Browser : BrowserDetect.browser,
      OS : BrowserDetect.OS,
      screenH: screen.height,
      screenUH: exp.height,
      screenW: screen.width,
      screenUW: exp.width
    };

  //blocks of the experiment:
  exp.structure=["i0", "instructions", "one_slider", 'subj_info', 'thanks'];

  exp.data_trials = [];
  //make corresponding slides:
  exp.slides = make_slides(exp);

  exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      exp.go();
    }
  });

  exp.go(); //show first slide
}
