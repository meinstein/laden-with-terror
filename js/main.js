var data
var lineData = []
var hussein_line_data = []
var dailyAvgBefore = 0
var monthyWordBefore = 0
var prevMonth = 0
var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
var $doc = $(document)
var year_month = '2001-09' //start date
var formatMonthYear = d3.time.format('%b %Y')
var formatDataLookUp = d3.time.format('%Y-%m')
var formatK = d3.format('0,000')
var data_keys
var snippet_dict
var margin = { top: 15, right: 15, bottom: 25, left: 15 }
var constants = [7748, 11210, 817] // total articles, avg articles per day, avg words per article
var x, y

$(document).ready(function() {
  //$('#stats').css('visibility', 'hidden');
  $('#template_holder').css('visibility', 'hidden')
  loadData()
  setTimeout(function() {
    loadSnippetDict()
  }, 500)
})

function loadData() {
  var path = 'data/MASTER_EVERYTHING.json'

  d3.json(path, function(error, json) {
    if (error) return console.warn(error)
    data = json
    $('#chart').fadeOut(350, function() {
      $(this).empty()
      bindInitialMonth()
      formatLineData()
    })

    data_keys = Object.keys(data)

    setTimeout(function() {
      $('#chart').fadeIn(500)
      addEventHandlers()
    }, 500)
  })
}

function bindInitialMonth() {
  d3.select('#output').html(formatMonthYear(d3.time.month.round(new Date(year_month))))
  // d3.select('#until-now').html(formatK(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].counter))
  //d3.select('#this-month').html(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length)
}

function formatLineData() {
  var keys = Object.keys(data)

  keys.map(function(obj) {
    correctDate = obj + '-01'
    lineData.push({
      date: correctDate,
      articles: data[obj].articles.length
    })
  })

  keys.map(function(obj) {
    correctDate = obj + '-01'
    hussein_line_data.push({
      date: correctDate,
      articles: data[obj].hussein_count
    })
  })

  makeChart()
  renderTemplate()
}

function renderTemplate() {
  $template_holder = $('#template_holder')

  $template_holder.fadeOut('fast', function() {
    $(this).empty()
    var template = $('#template').html(),
      rendered = Mustache.render(template, data[year_month])
    $(this).html(rendered)
    d3.select('li').classed('selected-section', true)
    d3.select('td.count').classed('selected-count', true)
    $(this).fadeIn('slow', function() {
      bindD3()
    })
  })
}

function bindD3() {
  var maxWords = data[year_month].words[0].count
  var minWords = data[year_month].words[19].count

  var colorWords = d3.scale
    .linear()
    .domain([minWords, maxWords])
    .range(['#eabc3b', '#d65454'])

  d3.selectAll('.articles-container')
    .data(data[year_month].articles)
    .enter()

  var word_list_items = d3
    .selectAll('td.list-count')
    .data(data[year_month].words)
    .enter()
  d3.selectAll('td.list-count').style('background', function(d) {
    return colorWords(d.count)
  })

  d3.selectAll('.articles-container')
    .select('td.td-title')
    .html(function(d) {
      if (d['h'].length > 6) {
        return d['h'][0] + "<i class='fa fa-exchange'></i>"
      } else {
        return d['h'][0]
      }
    })
}

function addEventHandlers() {
  $doc.on('click', 'li.section-list-item', function() {
    var $this = $(this)

    $('li').removeClass('selected-section')
    $('td.count').removeClass('selected-count')
    $this.addClass('selected-section')
    $this.find('td.count').addClass('selected-count')

    var section = $this.find('.section-name').html()
    selectSection(section)
  })

  $doc.on('click', '.fa-caret', function() {
    var direction = $(this).attr('id')
    clickDirection(direction)
  })

  $doc.on('click', 'i.fa-info-circle, span#title-text', function() {
    $('#about').css('left', '0')
  })

  $doc.on('click', 'i.close-about', function() {
    $('#about').css('left', '-110%')
  })

  $doc.on('click', '.toggle-component', function() {
    var $this = $(this)
    $this.siblings().removeClass('selected-component')
    $this.addClass('selected-component')
    $thisHTML = $this.html().toLowerCase()
    $thisIndex = $this.parents('.outer-stat-item').index()
    $thisSpan = $this
      .parent()
      .next('.stat-item')
      .find('.data')

    updateStatItem($thisSpan, $thisHTML, $thisIndex)
  })

  $doc.on('click', '.toggle-graph', function() {
    var $this = $(this)
    $this.siblings().removeClass('selected-graph')
    $this.addClass('selected-graph')
    if ($this.index() === 0) {
      d3.select('.hussein_area')
        .transition()
        .duration(800)
        .attr('opacity', 0)
    } else {
      d3.select('.hussein_area')
        .transition()
        .duration(800)
        .attr('opacity', 1)
    }
  })

  $doc.on('click', '.toggle-list', function() {
    var $this = $(this)
    $this.siblings().removeClass('selected-list')
    $this.addClass('selected-list')
    $thisHTML = $this.html().toLowerCase()

    if ($thisHTML === 'sections') {
      $('ul.words-list').fadeOut('fast', function() {
        $('ul.section-list').fadeIn('slow')
      })
    } else {
      $('ul.section-list').fadeOut('fast', function() {
        $('ul.words-list').fadeIn('slow')
      })
    }
  })

  $doc.on('click', 'tr.articles-row', function() {
    var $this = $(this).find('.view-snippet')

    if ($this.find('i').hasClass('fa-angle-down')) {
      var articlesRow = $this.closest('.articles-container')
      var datum = d3.select(articlesRow[0]).datum()
      var headline_id = datum['h'][4]
      var word_count = datum['h'][5]
      var url_raw = datum['h'][1]
      var url
      if (url_raw.charAt(0) == '/') {
        url = 'http://www.nytimes.com' + url_raw
      } else {
        url = 'http://' + url_raw
      }
      var snippet = snippet_dict[headline_id]
      var snippet_modified = snippet.replace('Osama bin Laden', '<span class="obl">Osama bin Laden</span>')

      $this.find('.fa').removeClass('fa-angle-down')
      $this.find('.fa').addClass('fa-close hi-lite')

      $this.closest('.articles-row').addClass('selected-articles-row')
      $this
        .closest('.articles-row')
        .next()
        .show()
      $this
        .closest('.articles-row')
        .next()
        .find('.toggle-text')
        .html(snippet_modified)
      $this
        .closest('.articles-row')
        .next()
        .next()
        .show()
      $this
        .closest('.articles-row')
        .next()
        .next()
        .find('.toggle-nyt-link')
        .html(
          '<a href=' +
            url +
            " target='_blank'><i class='fa fa-angle-double-right'>&nbsp</i>Click here to read full article (" +
            word_count +
            ' words)</a>'
        )
    } else {
      // .fa-close is present

      $this.find('.fa').removeClass('fa-close hi-lite')
      $this.find('.fa').addClass('fa-angle-down')

      $this.closest('.articles-row').removeClass('selected-articles-row')
      $this
        .closest('.articles-row')
        .next()
        .find('.toggle-text')
        .empty()
      $this
        .closest('.articles-row')
        .next()
        .hide()

      $this
        .closest('.articles-row')
        .next()
        .next()
        .find('.toggle-nyt-link')
        .empty()
      $this
        .closest('.articles-row')
        .next()
        .next()
        .hide()
    }
  })
} // end event handlers

function updateStatItem($thisSpan, $thisHTML, $thisIndex) {
  $thisSpan.fadeOut('fast', function() {
    if ($thisHTML === 'this month') {
      if ($thisIndex === 0) {
        $thisSpan.html(data[year_month].articles.length)
      } else if ($thisIndex === 1) {
        $thisSpan.html(data[year_month].hussein_count)
      } else {
        $thisSpan.html(data[year_month].overlap_counter)
      }
    } else {
      if ($thisIndex === 0) {
        $thisSpan.html(formatK(constants[$thisIndex]))
      } else if ($thisIndex === 1) {
        $thisSpan.html(formatK(constants[$thisIndex]))
      } else {
        $thisSpan.html(formatK(constants[$thisIndex]))
      }
    }

    $thisSpan.fadeIn('fast')
  })
}

function clickDirection(direction) {
  var nowIndex = data_keys.indexOf(year_month)
  var newIndex

  if (direction == 'left') {
    newIndex = nowIndex - 1

    if (newIndex > -1) {
      d3.select('#output')
        .style('opacity', 0)
        .html(formatMonthYear(d3.time.month.round(new Date(data_keys[newIndex]))))
        .transition()
        .duration(350)
        .style('opacity', 1)

      year_month = data_keys[newIndex]

      animateNumbers()
      animateMarker()
      renderTemplate()
    }
  } else {
    newIndex = nowIndex + 1

    if (newIndex < data_keys.length) {
      d3.select('#output')
        .style('opacity', 0)
        .html(formatMonthYear(d3.time.month.round(new Date(data_keys[newIndex]))))
        .transition()
        .duration(350)
        .style('opacity', 1)

      year_month = data_keys[newIndex]

      animateNumbers()
      animateMarker()
      renderTemplate()
    }
  }
}

function selectSection(sectionName) {
  d3.selectAll('.articles-container').style('display', function(d) {
    if (sectionName !== 'All') {
      if (d.h[3].indexOf(sectionName) < 0) {
        return 'none'
      } else {
        return 'table-row-group'
      }
    } else {
      return 'table-row-group'
    }
  })
}

function makeChart() {
  var containerWidth = $('#chart').width()
  var containerHeight = $('#chart').height()

  var width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.bottom - margin.top

  x = d3.time
    .scale()
    .domain([new Date(lineData[0].date), d3.time.day.offset(new Date(lineData[lineData.length - 1].date), 1)])
    .range([0, width])
    .clamp(true)

  y = d3.scale
    .linear()
    .range([height, 0])
    .domain([0, 669])

  var brush = d3.svg
    .brush()
    .x(x)
    .extent([0, 0])
    .on('brush', brushed)
    .on('brushend', brushended)

  var svg = d3
    .select('#chart')
    .append('svg')
    .attr('class', 'no-select')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  area = d3.svg
    .area()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y0(height)
    .y1(function(d) {
      return y(d.articles)
    })

  lineGen = d3.svg
    .line()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y(function(d) {
      return y(d.articles)
    })

  lineGen_hussein = d3.svg
    .line()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y(function(d) {
      return y(d.articles)
    })

  svg
    .append('svg:path')
    .attr('d', lineGen(hussein_line_data))
    .attr('class', 'hussein_line')
    .attr('stroke', 'rgb(234,188,59)')
    .attr('stroke-width', 1.5)
    .attr('opacity', 0)
    .attr('fill', 'none')

  svg
    .append('path')
    .datum(hussein_line_data)
    .attr('class', 'hussein_area')
    .attr('fill', 'rgba(234,188,59,0.85)')
    .attr('opacity', 0)
    .attr('d', area)

  svg
    .append('path')
    .datum(lineData)
    .attr('class', 'area')
    .attr('fill', 'rgba(214,84,84,0.70)')
    .attr('d', area)

  svg
    .append('svg:path')
    .attr('d', lineGen(lineData))
    .attr('class', 'line')
    .attr('stroke', 'rgb(214,84,84)')
    .attr('stroke-width', 1.5)
    .attr('opacity', 1)
    .attr('fill', 'none')

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.svg
        .axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%Y'))
        .tickSize(0)
        .tickPadding(10)
    )

  d3.select(d3.selectAll('.tick')[0][0]).attr('visibility', 'hidden')

  var slider = svg
    .append('g')
    .attr('class', 'slider')
    .call(brush)

  slider.select('.background').attr('height', height)

  var handleConnector = slider
    .append('svg:line')
    .attr('class', 'handle handle-connector')
    .attr('x1', x(new Date('2000-01')))
    .attr('y1', height)
    .attr('x2', x(new Date('2000-01')))
    .attr('y2', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))
    .attr('stroke-width', 1.5)
    //.style("stroke-dasharray", ("6, 4"))
    .attr('opacity', 0)
    .attr('stroke', '#1c1c1c')

  var handleBaseline = slider
    .append('circle')
    .attr('class', 'handle handle-bottom')
    .attr('cx', x(new Date('2000-01')))
    .attr('cy', height)
    .attr('r', 4)
    .attr('stroke-width', 2)
    .attr('stroke', '#1c1c1c')
    .attr('fill', '#f7f7f7')
    .attr('opacity', 0)

  var handleTop = slider
    .append('circle')
    .attr('class', 'handle handle-top')
    .attr('cx', x(new Date('2000-01')))
    .attr('cy', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))
    .attr('r', 4)
    .attr('stroke-width', 2)
    .attr('stroke', '#1c1c1c')
    .attr('fill', '#f7f7f7')
    .attr('opacity', 0)

  // transition text
  //

  var nine11 = svg
    .append('circle')
    .attr('cx', x(new Date('2001-09')))
    .attr('cy', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))
    .attr('r', 1)
    .attr('opacity', 0)
    .attr('stroke', '#d65454')
    .attr('stroke-width', '5')
    .attr('fill', '#eabc3b')

  var nine11_text = svg
    .append('text')
    .attr('x', x(new Date('2002-04')))
    .attr('y', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))
    .text('9/11 Attacks')
    .attr('opacity', 0)

  var death = svg
    .append('circle')
    .attr('cx', x(new Date('2011-05')))
    .attr('cy', y(data[formatDataLookUp(d3.time.month.round(new Date('2011-05')))].articles.length))
    .attr('r', 1)
    .attr('opacity', 0)
    .attr('stroke', '#d65454')
    .attr('stroke-width', '5')
    .attr('fill', '#eabc3b')

  var death_text = svg
    .append('text')
    .attr('x', x(new Date('2010-10')))
    .attr('y', y(data[formatDataLookUp(d3.time.month.round(new Date('2011-05')))].articles.length))
    .text('Osama bin Laden is killed')
    .attr('text-anchor', 'end')
    .attr('opacity', 0)

  var article_span = slider
    .append('svg:line')
    .attr('x1', x(new Date('2001-09')))
    .attr('y1', 2)
    .attr('x2', x(new Date('2011-05')))
    .attr('y2', 2)
    .style('stroke-width', 1.5)
    .attr('opacity', 0)
    .style('stroke', '#1c1c1c')
  var span_left = svg
    .append('circle')
    .attr('cx', x(new Date('2001-09')))
    .attr('cy', 2)
    .attr('r', 4)
    .attr('opacity', 0)
    .attr('stroke-width', 2)
    .attr('stroke', '#1c1c1c')
    .attr('fill', '#f7f7f7')
  var span_right = svg
    .append('circle')
    .attr('cx', x(new Date('2011-05')))
    .attr('cy', 2)
    .attr('r', 4)
    .attr('opacity', 0)
    .attr('stroke-width', 2)
    .attr('stroke', '#1c1c1c')
    .attr('fill', '#f7f7f7')
  var span_text = svg
    .append('text')
    .attr('x', x(new Date('2006-07')))
    .attr('y', 30)
    .text('Approximately one decade.')
    .attr('text-anchor', 'middle')
    .attr('opacity', 0)

  // immediately invoke these
  nine11
    .transition()
    .duration(2000)
    .attr('r', 30)
    .attr('opacity', 0.85)
    .transition()
    .duration(2000)
    .attr('r', 1)
    .attr('opacity', 0)
  nine11_text
    .transition()
    .delay(500)
    .duration(1500)
    .attr('opacity', 1)
    .transition()
    .duration(1500)
    .attr('opacity', 0)

  setTimeout(function() {
    death
      .transition()
      .duration(2000)
      .attr('r', 30)
      .attr('opacity', 0.85)
      .transition()
      .duration(2000)
      .attr('r', 1)
      .attr('opacity', 0)
    death_text
      .transition()
      .delay(500)
      .duration(1500)
      .attr('opacity', 1)
      .transition()
      .duration(1500)
      .attr('opacity', 0)
  }, 2500)

  setTimeout(function() {
    article_span
      .transition()
      .duration(2000)
      .attr('opacity', 1)
      .transition()
      .duration(1200)
      .attr('opacity', 0)
    span_left
      .transition()
      .duration(1500)
      .attr('opacity', 1)
      .transition()
      .duration(2500)
      .attr('opacity', 0)
    span_right
      .transition()
      .duration(1500)
      .attr('opacity', 1)
      .transition()
      .duration(2500)
      .attr('opacity', 0)
    span_text
      .transition()
      .duration(2000)
      .attr('opacity', 1)
      .transition()
      .duration(1800)
      .attr('opacity', 0)
  }, 5000)

  setTimeout(function() {
    //$('#stats').css('visibility','visible').hide().fadeIn();
    $('#template_holder')
      .css('visibility', 'visible')
      .hide()
      .fadeIn(1200)

    animateNumbers()

    $('#date').fadeIn(1200)
    d3.selectAll('.handle')
      .transition()
      .duration(2000)
      .style('opacity', 1)
    $('footer').show()

    handleBaseline
      .transition()
      .duration(1000)
      .attr('cx', x(new Date(year_month)))
      .style('opacity', 1)
    handleTop
      .transition()
      .duration(1000)
      .attr('cx', x(new Date(year_month)))
      .style('opacity', 1)
    handleConnector
      .transition()
      .duration(1000)
      .attr('x1', x(new Date(year_month)))
      .attr('x2', x(new Date(year_month)))
      .style('opacity', 1)
  }, 7500)

  function brushed() {
    var value = brush.extent(brush.extent())[0]

    if (d3.event.sourceEvent) {
      // not a programmatic event
      value = d3.time.month.round(x.invert(d3.mouse(this)[0]))
      brush.extent([value, value])
    }

    d3.select('#output').html(formatMonthYear(value))

    handleBaseline.attr('cx', x(value))
    handleTop
      .attr('cx', x(value))
      .attr('cy', y(data[formatDataLookUp(d3.time.month.round(new Date(value)))].articles.length))
    handleConnector
      .attr('x1', x(value))
      .attr('x2', x(value))
      .attr('y2', y(data[formatDataLookUp(d3.time.month.round(new Date(value)))].articles.length))
  }

  function brushended() {
    var value = brush.extent(brush.extent())[0]

    if (d3.event.sourceEvent) {
      // not a programmatic event
      value = d3.time.month.round(x.invert(d3.mouse(this)[0]))
      brush.extent([value, value])
    }

    year_month = formatDataLookUp(value)
    animateNumbers()
    $('.toggle-component').removeClass('selected-component')
    $('.init').addClass('selected-component')
    renderTemplate()
  }
} // END MAKECHART()

function animateNumbers() {
  var dailyAvg = data[year_month].overlap_counter
  $('#daily-article-avg')
    .prop('number', dailyAvgBefore)
    .animateNumber({ number: dailyAvg, numberStep: comma_separator_number_step }, 350)

  // $('#daily-article-avg').numerator({
  //   easing: 'linear',
  //   duration: 350,
  //   delimeter:'.',
  //   rounding: 2,
  //   toValue: dailyAvg
  // })

  // make them all above widget eventually! it's way cleaner
  var monthlyWordAvg = d3.round(data[year_month].hussein_count)
  $('#monthly-word-avg')
    .prop('number', monthyWordBefore)
    .animateNumber({ number: monthlyWordAvg, numberStep: comma_separator_number_step }, 350)

  var thisMonth = data[year_month].articles.length
  $('#this-month')
    .prop('number', prevMonth)
    .animateNumber({ number: thisMonth, numberStep: comma_separator_number_step }, 350)

  dailyAvgBefore = dailyAvg
  monthyWordBefore = monthlyWordAvg
  prevMonth = thisMonth
}

function animateMarker() {
  var containerWidth = $('#container').width()
  var containerHeight = $('#chart').height()

  var width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.bottom - margin.top

  x = d3.time
    .scale()
    .domain([new Date(lineData[0].date), d3.time.day.offset(new Date(lineData[lineData.length - 1].date), 1)])
    .range([0, width])
    .clamp(true)

  y = d3.scale
    .linear()
    .range([height, 0])
    .domain([0, 669])

  d3.select('.handle-bottom')
    .transition()
    .duration(350)
    .attr('cx', x(new Date(year_month)))
  d3.select('.handle-top')
    .transition()
    .duration(350)
    .attr('cx', x(new Date(year_month)))
    .attr('cy', y(data[year_month].articles.length))
  d3.select('.handle-connector')
    .transition()
    .duration(350)
    .attr('x1', x(new Date(year_month)))
    .attr('x2', x(new Date(year_month)))
    .attr('y2', y(data[year_month].articles.length))
}

function loadSnippetDict() {
  var path = '../python/FULL_00_12.json'

  d3.json(path, function(error, json) {
    if (error) return console.warn(error)
    snippet_dict = json
  })
}

function resize() {
  var containerWidth = $('#chart').width()
  var containerHeight = $('#chart').height()

  var width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.bottom - margin.top

  x = d3.time
    .scale()
    .domain([new Date(lineData[0].date), d3.time.day.offset(new Date(lineData[lineData.length - 1].date), 1)])
    .range([0, width])
    .clamp(true)

  y = d3.scale
    .linear()
    .range([height, 0])
    .domain([0, 669])

  d3.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  d3.select('.axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.svg
        .axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%Y'))
        .tickSize(0)
        .tickPadding(10)
    )

  lineGen = d3.svg
    .line()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y(function(d) {
      return y(d.articles)
    })

  lineGen_hussein = d3.svg
    .line()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y(function(d) {
      return y(d.articles)
    })

  area = d3.svg
    .area()
    .x(function(d) {
      return x(new Date(d.date))
    })
    .y0(height)
    .y1(function(d) {
      return y(d.articles)
    })

  d3.select('path.hussein_area')
    .datum(hussein_line_data)
    .attr('d', area)

  d3.select('path.hussein_line').attr('d', lineGen_hussein(hussein_line_data))

  d3.select('path.area')
    .datum(lineData)
    .attr('d', area)

  d3.select('path.line').attr('d', lineGen(lineData))

  d3.select('.handle-connector')
    .attr('x1', x(new Date(year_month)))
    .attr('y1', height)
    .attr('x2', x(new Date(year_month)))
    .attr('y2', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))

  d3.select('.handle-bottom')
    .attr('cx', x(new Date(year_month)))
    .attr('cy', height)

  d3.select('.handle-top')
    .attr('cx', x(new Date(year_month)))
    .attr('cy', y(data[formatDataLookUp(d3.time.month.round(new Date(year_month)))].articles.length))
}

$(window).resize(function() {
  resize()
})
